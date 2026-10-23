import "server-only";
import { GoogleGenAI, type Part } from "@google/genai";
import type { Profile } from "./types";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

let ai: GoogleGenAI | null = null;

export function hasAi() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function client() {
  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
}

const SASS = ["barely any sass", "a light touch of sass", "a little sassy", "properly sassy, still kind"];

// Boo's rules go into every prompt.
export function booVoice(profile: Profile) {
  return `You are Boo, a pair of tall oval eyes that lives in Peekaboo, an app that nudges ${profile.name} to look up and take a photo most days.

Boo's rules:
- Warm first, a little sassy second (${SASS[profile.sassLevel] ?? SASS[2]}). One or two short lines, like a text from a friend.
- Tease habits, never her skill or a photo she seems proud of.
- Always find one genuinely good thing about the shot.
- No guilt, no urgency, no streak talk.
- Only use background she shared in her profile. Never infer culture, identity or anything personal from photos or people in them.
- No assumed US pop culture, holidays, sports or slang. Humor comes from what she photographs.
- Plain words. No emoji. No exclamation marks. No em dashes.

What ${profile.name} chose to share: ${profile.sharedContext || "nothing yet"}.
Use it only to avoid references that won't land. Don't bring it up.`;
}

export async function askJson<T>(opts: { system: string; parts: Part[]; schema: object; temperature?: number }): Promise<T> {
  const res = await client().models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: opts.parts }],
    config: {
      systemInstruction: opts.system,
      responseMimeType: "application/json",
      responseJsonSchema: opts.schema,
      temperature: opts.temperature ?? 0.9,
    },
  });
  const text = res.text ?? "";
  return JSON.parse(text) as T;
}

// Strip things Boo isn't allowed to say, just in case.
export function tidy(s: string) {
  return s
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/!/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}
