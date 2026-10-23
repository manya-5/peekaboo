// Put the app back to the seeded state before a demo run: removes photos you
// took (keeps the October samples) and today's spots, so Home writes a fresh one.
// Run: node --env-file=.env.local scripts/reset-demo.ts
import { createClient } from "@supabase/supabase-js";
import { SAMPLE_PROFILE } from "../src/lib/sample.ts";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const today = new Intl.DateTimeFormat("en-CA", { timeZone: SAMPLE_PROFILE.timezone }).format(new Date());

const { data: photos } = await db.from("photos").select("id, storage_path").not("storage_path", "like", "%/seed/%");
if (photos?.length) {
  await db.storage.from("photos").remove(photos.map((p) => p.storage_path));
  await db.from("photos").delete().in(
    "id",
    photos.map((p) => p.id),
  );
}
const { count } = await db.from("spots").delete({ count: "exact" }).eq("date", today);
console.log(`Removed ${photos?.length ?? 0} photo(s) and ${count ?? 0} spot(s) for ${today}. Seeded October is untouched.`);
