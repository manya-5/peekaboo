import { randomUUID } from "node:crypto";
import { fail, notReady } from "@/lib/api";
import { getProfile, getSpot } from "@/lib/data";
import { BUCKET, db } from "@/lib/supabase";
import { todayIn } from "@/lib/time";

export const maxDuration = 30;

// Save a new (not yet kept) photo. The client has already compressed it.
export async function POST(req: Request) {
  const nope = notReady();
  if (nope) return nope;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob) || !file.type.startsWith("image/")) return Response.json({ error: "That isn't a photo" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return Response.json({ error: "That photo is too big" }, { status: 413 });

    const profile = await getProfile();
    const spotId = typeof form.get("spotId") === "string" ? (form.get("spotId") as string) : null;
    const spot = spotId ? await getSpot(spotId) : null;
    const takenAtRaw = form.get("takenAt");
    const takenAt = typeof takenAtRaw === "string" && !Number.isNaN(Date.parse(takenAtRaw)) ? takenAtRaw : new Date().toISOString();

    const id = randomUUID();
    const path = `${profile.id}/${todayIn(profile.timezone, new Date(takenAt)).slice(0, 7)}/${id}.jpg`;
    const up = await db().storage.from(BUCKET).upload(path, file, { contentType: "image/jpeg", upsert: false });
    if (up.error) throw up.error;

    const { error } = await db().from("photos").insert({
      id,
      profile_id: profile.id,
      taken_at: takenAt,
      storage_path: path,
      spot_id: spot?.id ?? null,
      kept: false,
    });
    if (error) throw error;
    return Response.json({ id });
  } catch (e) {
    return fail(e);
  }
}
