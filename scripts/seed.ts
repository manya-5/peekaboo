// Seed October with Manya's photos and the four sample contests, then run the
// real contest matcher on each photo (needs the app running on localhost:3000).
// Run: node --env-file=.env.local scripts/seed.ts
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { SAMPLE_CONTESTS, SAMPLE_PHOTOS, SAMPLE_PROFILE } from "../src/lib/sample.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase isn't set in .env.local");
const APP = process.env.APP_URL ?? "http://localhost:3000";

const db = createClient(url, key, { auth: { persistSession: false } });
const SEED_DIR = `${SAMPLE_PROFILE.id}/seed`;

async function must<T>(p: PromiseLike<{ data: T; error: unknown }>) {
  const { data, error } = await p;
  if (error) throw error;
  return data;
}

await must(db.from("profile").upsert(SAMPLE_PROFILE));
await must(db.from("contests").upsert(SAMPLE_CONTESTS));

// Clear out any earlier seed (rows, their matches, and files).
const old = await must(db.from("photos").select("id, storage_path").like("storage_path", `${SEED_DIR}/%`));
if (old.length) {
  await must(db.from("photos").delete().in("id", old.map((p) => p.id)));
  await db.storage.from("photos").remove(old.map((p) => p.storage_path));
}

for (const p of SAMPLE_PHOTOS) {
  const path = `${SEED_DIR}/${p.file}`;
  const bytes = await readFile(new URL(`../supabase/seed-photos/${p.file}`, import.meta.url));
  const up = await db.storage.from("photos").upload(path, bytes, { contentType: "image/jpeg", upsert: true });
  if (up.error) throw up.error;
  await must(
    db.from("photos").upsert({
      id: p.id,
      profile_id: SAMPLE_PROFILE.id,
      taken_at: p.taken_at,
      storage_path: path,
      what: p.what,
      tags: p.tags,
      kept: true,
    }),
  );
}
console.log(`Seeded ${SAMPLE_PHOTOS.length} photos and ${SAMPLE_CONTESTS.length} contests.`);

// Real matches, through the app's own matcher. Free-tier Gemini is rate
// limited, so go slowly and retry.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
for (const p of SAMPLE_PHOTOS) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${APP}/api/contests/match`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ photoId: p.id }),
    });
    if (res.ok) {
      const j = await res.json();
      if (j.matches?.length) console.log(`${p.file}: ${j.note}`);
      break;
    }
    await sleep(8000);
  }
  await sleep(1500);
}
const matches = await must(db.from("contest_matches").select("contest_id, reason, photos(storage_path)"));
console.log(`${matches.length} real matches saved.`);
