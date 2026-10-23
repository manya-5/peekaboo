import "server-only";
import { GoogleGenAI, ThinkingLevel, type Part } from "@google/genai";
import type { Profile } from "./types";

// 3.6 Flash: fast with images and reliably available on the free tier.
// Set GEMINI_MODEL to try a newer one (3.8 Flash was overloaded during the build).
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

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

// If the newest Flash model is busy, step down to the next one.
// Each model has its own free-tier quota, so stepping down also helps there.
const MODELS = [...new Set([GEMINI_MODEL, "gemini-3.5-flash", "gemini-3-flash-preview"])];

const busy = (e: unknown) => {
  const status = (e as { status?: number })?.status;
  const name = (e as { name?: string })?.name;
  return status === 429 || status === 500 || status === 503 || status === 404 || name === "AbortError" || name === "TimeoutError";
};

export async function askJson<T>(opts: { system: string; parts: Part[]; schema: object; temperature?: number }): Promise<T> {
  let last: unknown;
  for (const model of MODELS) {
    try {
      const res = await client().models.generateContent({
        model,
        contents: [{ role: "user", parts: opts.parts }],
        config: {
          systemInstruction: opts.system,
          responseMimeType: "application/json",
          responseJsonSchema: opts.schema,
          temperature: opts.temperature ?? 0.9,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          abortSignal: AbortSignal.timeout(15_000),
        },
      });
      return JSON.parse(res.text ?? "") as T;
    } catch (e) {
      last = e;
      if (!busy(e)) throw e;
      console.warn(`${model} is busy, trying the next model`);
    }
  }
  throw last;
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
