import "server-only";
import { askJson, booVoice, hasAi, tidy } from "./gemini";
import { getPhotoRow, openContests } from "./data";
import { db } from "./supabase";
import { timeLeft, todayIn } from "./time";
import type { Profile } from "./types";

type Result = {
  subject: string;
  matches: { contest_id: string; fits: boolean; confidence: number; reason: string }[];
};

const SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string", description: "The photo's main subject in one to three lowercase words, as she'd say it: 'bridge', 'mushroom', 'blue tram'." },
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          contest_id: { type: "string" },
          fits: { type: "boolean", description: "True only if a judge would see this photo as clearly on theme." },
          confidence: { type: "number", description: "0 to 1." },
          reason: { type: "string", description: "One short sentence on why it fits or not." },
        },
        required: ["contest_id", "fits", "confidence", "reason"],
      },
    },
  },
  required: ["subject", "matches"],
};

const MIN_CONFIDENCE = 0.6;

// Compares a kept photo with each open contest and saves good fits.
// It only suggests; nothing is ever entered.
export async function matchContests(profile: Profile, photoId: string) {
  const row = await getPhotoRow(photoId);
  if (!row || !row.kept) throw new Error("Photo not kept");
  const today = todayIn(profile.timezone);
  const contests = await openContests(today);
  if (!contests.length || !hasAi()) return { matches: [], note: null };

  const prompt = `A photo ${profile.name} just kept:
Description: ${row.what ?? "unknown"}
Tags: ${(row.tags ?? []).join(", ")}

Open photography contests:
${contests.map((ct) => `- id ${ct.id}: "${ct.name}". Theme: ${ct.theme}. ${ct.description ?? ""}`).join("\n")}

For each contest, say whether this photo fits its theme. Be honest: only say it fits if the theme is clearly the subject of the photo.`;

  const r = await askJson<Result>({ system: booVoice(profile), parts: [{ text: prompt }], schema: SCHEMA, temperature: 0.2 });

  const valid = new Map(contests.map((ct) => [ct.id, ct]));
  const good = (r.matches ?? []).filter((m) => m.fits && m.confidence >= MIN_CONFIDENCE && valid.has(m.contest_id));

  if (good.length) {
    const { error } = await db()
      .from("contest_matches")
      .upsert(
        good.map((m) => ({ photo_id: photoId, contest_id: m.contest_id, reason: tidy(m.reason), confidence: m.confidence })),
        { onConflict: "photo_id,contest_id" },
      );
    if (error) throw error;
  }

  const best = good.sort((a, b) => b.confidence - a.confidence || (valid.get(a.contest_id)!.deadline < valid.get(b.contest_id)!.deadline ? -1 : 1))[0];
  const subject = tidy(r.subject || "photo").toLowerCase().replace(/\.$/, "");
  const note = best ? `Psst. Your ${subject} could go to a contest. ${timeLeft(today, valid.get(best.contest_id)!.deadline, true)}.` : null;

  return { matches: good, note };
}
