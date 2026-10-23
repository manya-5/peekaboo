import "server-only";
import { askJson, booVoice, hasAi, tidy } from "./gemini";
import { getPhotoRow, getPhotos, getSpot, recentPhotoContext } from "./data";
import { BUCKET, db } from "./supabase";
import { todayIn } from "./time";
import type { Profile } from "./types";

export type Reaction = {
  what: string;
  tags: string[];
  matches_spot: boolean;
  repeat_subject: { is_repeat: boolean; count: number; past_photo_ids: string[] };
  lines: string[];
  craft_note: string;
};

const SCHEMA = {
  type: "object",
  properties: {
    what: { type: "string", description: "One plain sentence describing what is in the photo. Describe scenes and objects, never a person's identity, culture or background." },
    tags: { type: "array", items: { type: "string" }, description: "4 to 7 short lowercase tags for the main subjects, setting, light and colour." },
    matches_spot: { type: "boolean", description: "True if the photo fits today's spot." },
    repeat_subject: {
      type: "object",
      properties: {
        is_repeat: { type: "boolean", description: "True if the main subject is the same thing she has photographed before (the same place or object, not just a similar category)." },
        count: { type: "integer", description: "How many times she has shot this subject this month, including this photo." },
        past_photo_ids: { type: "array", items: { type: "string" }, description: "Ids of her earlier photos of the same subject, from the list given." },
      },
      required: ["is_repeat", "count", "past_photo_ids"],
    },
    lines: {
      type: "array",
      items: { type: "string" },
      description: "Exactly two lines from Boo. Line 1 is very short (2 to 5 words). Line 2 is one short sentence.",
    },
    craft_note: { type: "string", description: "One short sentence about something genuinely good in this shot. Often starts with 'But'." },
  },
  required: ["what", "tags", "matches_spot", "repeat_subject", "lines", "craft_note"],
};

export async function reactToPhoto(profile: Profile, photoId: string) {
  const row = await getPhotoRow(photoId);
  if (!row) throw new Error("Photo not found");

  if (!row.boo_reaction?.length) {
    if (!hasAi()) throw new Error("Gemini isn't set up yet");
    const [file, spot, recent] = await Promise.all([
      db().storage.from(BUCKET).download(row.storage_path),
      row.spot_id ? getSpot(row.spot_id) : Promise.resolve(null),
      recentPhotoContext(profile, 30, photoId),
    ]);
    if (file.error || !file.data) throw file.error ?? new Error("Couldn't read the photo");
    const base64 = Buffer.from(await file.data.arrayBuffer()).toString("base64");
    const today = todayIn(profile.timezone, new Date(row.taken_at));

    const prompt = `${profile.name} just took this photo on ${today}.
${spot ? `Today's spot was "${spot.title}" (look in: ${spot.habitat}).` : "She wasn't shooting for a spot. She just saw something."}

Her recent photos, newest first (id, date, description, tags):
${recent.map((p) => `- ${p.id} | ${p.date} | ${p.what ?? "no description"} | ${p.tags.join(", ")}`).join("\n") || "- none yet"}

Read the photo, then react as Boo in two lines and add a craft note.
- Line 1 teases a habit if there is one, like "The bridge. Again." If there is no habit, line 1 is a short, warm reaction to what's in the frame, specific to this photo.
- Line 2 is a pattern or a fact, like "Fourth time this month. It knows your face by now." If it's new for her, say so in a way that's specific to her roll, like noticing she usually shoots something else.
- If she shot for the spot, you can say whether it fits, lightly.
- The craft note is always something genuinely good about the shot: the light, the framing, a colour, a moment. Be specific to this photo.
- Count repeats only for the same subject (the same bridge, the same window), and only from this month's list.`;

    const r = await askJson<Reaction>({
      system: booVoice(profile),
      parts: [{ inlineData: { mimeType: "image/jpeg", data: base64 } }, { text: prompt }],
      schema: SCHEMA,
    });

    const known = new Set(recent.map((p) => p.id));
    const past = r.repeat_subject?.is_repeat ? (r.repeat_subject.past_photo_ids ?? []).filter((id) => known.has(id)) : [];
    const lines = (r.lines ?? []).map(tidy).filter(Boolean).slice(0, 2);

    const { error } = await db()
      .from("photos")
      .update({
        what: tidy(r.what ?? ""),
        tags: (r.tags ?? []).map((t) => t.toLowerCase().trim()).slice(0, 8),
        matches_spot: Boolean(r.matches_spot),
        boo_reaction: lines.length ? lines : ["Oh, nice."],
        craft_note: tidy(r.craft_note ?? ""),
        repeat_of: past,
      })
      .eq("id", photoId);
    if (error) throw error;
    Object.assign(row, { boo_reaction: lines, craft_note: tidy(r.craft_note ?? ""), repeat_of: past, what: r.what, tags: r.tags, matches_spot: r.matches_spot });
  }

  const pastPhotos = await getPhotos(row.repeat_of ?? []);
  return {
    what: row.what,
    tags: row.tags,
    matches_spot: row.matches_spot,
    repeat_subject: { is_repeat: (row.repeat_of ?? []).length > 0, count: (row.repeat_of ?? []).length + 1, past_photo_ids: row.repeat_of ?? [] },
    lines: row.boo_reaction,
    craft_note: row.craft_note,
    past: pastPhotos.map((p) => ({ id: p.id, url: p.url, date: todayIn(profile.timezone, new Date(p.takenAt)) })),
  };
}
