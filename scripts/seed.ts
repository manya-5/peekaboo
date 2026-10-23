// Seed October with the sample photos and the four sample contests.
// Run: node --env-file=.env.local scripts/seed.ts
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { SAMPLE_CONTESTS, SAMPLE_MATCHES, SAMPLE_PHOTOS, SAMPLE_PROFILE } from "../src/lib/sample.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase isn't set in .env.local");

const db = createClient(url, key, { auth: { persistSession: false } });

async function must<T>(p: PromiseLike<{ data: T; error: unknown }>) {
  const { data, error } = await p;
  if (error) throw error;
  return data;
}

await must(db.from("profile").upsert(SAMPLE_PROFILE));
await must(db.from("contests").upsert(SAMPLE_CONTESTS));

for (const p of SAMPLE_PHOTOS) {
  const path = `${SAMPLE_PROFILE.id}/seed/${p.file}`;
  const bytes = await readFile(new URL(`../public/images/${p.file}`, import.meta.url));
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

await must(
  db.from("contest_matches").upsert(
    SAMPLE_MATCHES.map(({ photo_id, contest_id, reason, confidence }) => ({ photo_id, contest_id, reason, confidence })),
  ),
);

console.log(`Seeded ${SAMPLE_PHOTOS.length} photos, ${SAMPLE_CONTESTS.length} contests, ${SAMPLE_MATCHES.length} matches.`);
