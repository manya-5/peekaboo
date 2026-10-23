// Finds the "peekaboo" Supabase project, writes its URL and keys into
// .env.local (never printed), adds a CRON_SECRET, and applies the schema.
// Needs `supabase login` first, or SUPABASE_ACCESS_TOKEN in .env.local.
// Run: node scripts/connect-supabase.ts
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const ENV = new URL("../.env.local", import.meta.url);
let env = readFileSync(ENV, "utf8");

const get = (k: string) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim() ?? "";
const set = (k: string, v: string) => {
  env = new RegExp(`^${k}=`, "m").test(env) ? env.replace(new RegExp(`^${k}=.*$`, "m"), `${k}=${v}`) : `${env.trimEnd()}\n${k}=${v}\n`;
};

const token = get("SUPABASE_ACCESS_TOKEN");
const sb = (...args: string[]) =>
  execFileSync("npx", ["-y", "supabase@latest", ...args], {
    encoding: "utf8",
    env: token ? { ...process.env, SUPABASE_ACCESS_TOKEN: token } : process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

const projects = JSON.parse(sb("projects", "list", "-o", "json")) as { id?: string; ref?: string; name: string; status?: string }[];
const project = projects.find((p) => p.name.toLowerCase() === "peekaboo");
if (!project) {
  console.log(`No project called "peekaboo". Found: ${projects.map((p) => p.name).join(", ") || "none"}`);
  process.exit(1);
}
const ref = (project.ref ?? project.id)!;
console.log(`Found project peekaboo (${ref}), status ${project.status ?? "unknown"}`);

const keys = JSON.parse(sb("projects", "api-keys", "--project-ref", ref, "-o", "json")) as { name: string; api_key: string }[];
const anon = keys.find((k) => k.name === "anon")?.api_key;
const service = keys.find((k) => k.name === "service_role")?.api_key;
if (!anon || !service) throw new Error("Couldn't find the anon and service_role keys");

set("NEXT_PUBLIC_SUPABASE_URL", `https://${ref}.supabase.co`);
set("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon);
set("SUPABASE_SERVICE_ROLE_KEY", service);
if (!get("CRON_SECRET")) set("CRON_SECRET", randomBytes(24).toString("hex"));
writeFileSync(ENV, env);
console.log("Wrote Supabase URL, keys and CRON_SECRET to .env.local");

sb("db", "query", "--linked", "--project-ref", ref, "-f", new URL("../supabase/schema.sql", import.meta.url).pathname);
console.log("Applied supabase/schema.sql");
