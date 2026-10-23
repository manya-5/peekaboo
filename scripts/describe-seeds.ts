// Ask Gemini to describe and tag each photo in supabase/seed-photos, so Boo
// knows the roll it's seeding. Writes supabase/seed-photos/described.json.
// Run: node --env-file=.env.local scripts/describe-seeds.ts
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const dir = new URL("../supabase/seed-photos/", import.meta.url);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3-flash-preview"];

const schema = {
  type: "object",
  properties: {
    what: { type: "string", description: "One plain sentence describing the photo. Scenes and objects only; never guess anyone's identity or background." },
    tags: { type: "array", items: { type: "string" }, description: "4 to 7 short lowercase tags for subjects, setting, light and colour." },
  },
  required: ["what", "tags"],
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function describe(file: string) {
  const data = readFileSync(new URL(file, dir)).toString("base64");
  for (let attempt = 0; attempt < 6; attempt++) {
    const model = MODELS[attempt % MODELS.length];
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ inlineData: { mimeType: "image/jpeg", data } }, { text: "Describe this photo for a personal photo roll." }] }],
        config: { responseMimeType: "application/json", responseJsonSchema: schema, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
      });
      return JSON.parse(res.text ?? "") as { what: string; tags: string[] };
    } catch (e) {
      console.warn(`${file}: ${model} failed (${(e as { status?: number }).status ?? "?"}), retrying`);
      await sleep(4000);
    }
  }
  throw new Error(`Couldn't describe ${file}`);
}

const out: Record<string, { what: string; tags: string[] }> = {};
for (const f of readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort()) {
  out[f] = await describe(f);
  console.log(`${f}: ${out[f].what} [${out[f].tags.join(", ")}]`);
}
writeFileSync(new URL("described.json", dir), JSON.stringify(out, null, 2));
