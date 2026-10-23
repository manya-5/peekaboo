import "server-only";
import { db, hasDb } from "./supabase";
import { askJson, booVoice, hasAi, tidy } from "./gemini";
import { contestsWithMatches, getActiveSpot, recentPhotoContext, spotsForDate, toSpot } from "./data";
import { dayWeather } from "./weather";
import { addDays, fromMinutes, isWeekend, toMinutes } from "./time";
import type { Profile, Spot } from "./types";

type Draft = {
  title: string;
  spotting: string;
  habitat: string;
  best_from: string;
  best_to: string;
  nudge: string;
  contest_id: string;
};

// Used when the AI isn't available. Small, everyday, no special trip needed.
const FALLBACKS = [
  { title: "Find a long shadow", spotting: "Spotting a long shadow", habitat: "Sidewalks, stairs", light: "golden" },
  { title: "Only reflections", spotting: "Spotting reflections", habitat: "Puddles, windows, car doors", light: "any" },
  { title: "Something blue", spotting: "Spotting something blue", habitat: "Doors, signs, bikes", light: "any" },
  { title: "Look up", spotting: "Spotting something above you", habitat: "Ceilings, trees, wires", light: "any" },
  { title: "Light through leaves", spotting: "Spotting light through leaves", habitat: "Parks, street trees", light: "golden" },
  { title: "Two of the same", spotting: "Spotting a pair", habitat: "Benches, windows, shoes", light: "any" },
];

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "The spot, 2 to 5 words, sentence case, no full stop. Like 'Find a long shadow' or 'Only reflections'." },
    spotting: { type: "string", description: "Short camera pill, starting with 'Spotting'. Like 'Spotting a long shadow' or 'Spotting reflections'." },
    habitat: { type: "string", description: "Where to look, two or three short places separated by commas. Like 'Sidewalks, stairs'." },
    best_from: { type: "string", description: "Start of the best light window, 24h HH:MM local time." },
    best_to: { type: "string", description: "End of the best light window, 24h HH:MM local time." },
    nudge: { type: "string", description: "One short line from Boo to go with the spot, under 14 words." },
    contest_id: { type: "string", description: "The id of the contest this spot serves, or an empty string." },
  },
  required: ["title", "spotting", "habitat", "best_from", "best_to", "nudge", "contest_id"],
};

const validTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

function goldenWindow(sunset: string) {
  const s = toMinutes(sunset);
  return { from: fromMinutes(Math.floor((s - 120) / 30) * 30), to: fromMinutes(Math.round(s / 30) * 30) };
}

export async function draftSpot(profile: Profile, date: string, avoid: string[]): Promise<Draft> {
  const weather = await dayWeather(profile.lat, profile.lng, profile.timezone, date);
  const golden = goldenWindow(weather.sunset);

  const fallback = (): Draft => {
    const pool = FALLBACKS.filter((f) => !avoid.includes(f.title));
    const pick = (pool.length ? pool : FALLBACKS)[Math.floor(Math.random() * (pool.length || FALLBACKS.length))];
    const half = (m: number) => fromMinutes(Math.round(m / 30) * 30);
    const win = pick.light === "golden" ? golden : { from: half(toMinutes(weather.sunset) - 240), to: half(toMinutes(weather.sunset) - 60) };
    return { title: pick.title, spotting: pick.spotting, habitat: pick.habitat, best_from: win.from, best_to: win.to, nudge: "", contest_id: "" };
  };

  if (!hasAi()) return fallback();

  const [recent, contests] = await Promise.all([recentPhotoContext(profile, 30), contestsWithMatches(date)]);
  const tagCounts = new Map<string, number>();
  recent.forEach((p) => p.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)));
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} (${n})`);
  const unmatched = contests.filter((x) => !x.match);

  const prompt = `Write ${profile.name}'s photo spot for ${date} (${isWeekend(date) ? "a weekend, so it can be a little bigger" : "a weekday, so keep it quick, something she can catch on a walk between things"}).

Where: ${profile.city ?? "her city"}.
Weather that day: ${weather.summary}${weather.tempMaxC != null ? `, high ${Math.round(weather.tempMaxC)}°C` : ""}${weather.precipChance != null ? `, ${weather.precipChance}% chance of rain` : ""}${weather.cloudCover != null ? `, ${Math.round(weather.cloudCover)}% cloud` : ""}.
Sunrise ${weather.sunrise}, sunset ${weather.sunset}. Golden hour is roughly ${golden.from} to ${golden.to}.

Tags from her last ${recent.length} photos, most common first: ${tags.join(", ") || "none yet"}.

Open contests with no matching photo yet (prefer one of these themes, as long as the deadline hasn't passed):
${unmatched.map((x) => `- id ${x.id}: "${x.name}", theme "${x.theme}", deadline ${x.deadline}`).join("\n") || "- none"}

Personal theme: none.
Recent and already-swapped spots: ${avoid.join("; ") || "none"}. Don't repeat any of these or anything close to them; pick a clearly different idea.

A spot is small and everyday. It makes an ordinary thing worth stopping for. Examples: "Find a long shadow", "Only reflections", "Something blue", "Look up". It should be something she can find without going anywhere special, and it can gently steer her away from what she already shoots a lot.
Pick a best light window of about two hours that suits the spot and the weather, between sunrise and sunset. Long shadows and warm light mean the last two hours before sunset. Rain means reflections can be good any time.
If the spot serves one of the contests above, put that contest's id in contest_id; otherwise use an empty string.`;

  try {
    const d = await askJson<Draft>({ system: booVoice(profile), parts: [{ text: prompt }], schema: SCHEMA });
    if (!d.title || avoid.includes(d.title)) return fallback();
    if (!validTime(d.best_from) || !validTime(d.best_to) || toMinutes(d.best_to) <= toMinutes(d.best_from)) {
      d.best_from = golden.from;
      d.best_to = golden.to;
    }
    d.title = tidy(d.title).replace(/\.$/, "");
    d.spotting = tidy(d.spotting || `Spotting ${d.title.toLowerCase()}`).replace(/\.$/, "");
    d.habitat = tidy(d.habitat).replace(/\.$/, "");
    d.nudge = tidy(d.nudge ?? "");
    if (!contests.some((x) => x.id === d.contest_id)) d.contest_id = "";
    return d;
  } catch (e) {
    console.error("spot generation failed", e);
    return fallback();
  }
}

async function insertSpot(profile: Profile, date: string, d: Draft, source?: Spot["source"]): Promise<Spot> {
  const { data, error } = await db()
    .from("spots")
    .insert({
      profile_id: profile.id,
      date,
      title: d.title,
      spotting: d.spotting,
      habitat: d.habitat,
      best_from: d.best_from,
      best_to: d.best_to,
      nudge: d.nudge || null,
      source: source ?? (d.contest_id ? "contest" : "daily"),
      contest_id: d.contest_id || null,
      status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return toSpot(data);
}

// Today's spot, creating it if the daily job hasn't yet.
export async function ensureSpot(profile: Profile, date: string): Promise<Spot | null> {
  if (!hasDb()) return null;
  const existing = await getActiveSpot(profile, date);
  if (existing) return existing;
  return insertSpot(profile, date, await draftSpot(profile, date, await recentTitles(profile, date)));
}

// Spot titles from the few days before `date`, so days don't repeat.
async function recentTitles(profile: Profile, date: string) {
  const { data } = await db()
    .from("spots")
    .select("title")
    .eq("profile_id", profile.id)
    .gte("date", addDays(date, -3))
    .lt("date", date);
  return [...new Set((data ?? []).map((r) => r.title as string))];
}

export async function swapSpot(profile: Profile, date: string): Promise<Spot> {
  const [all, recent] = await Promise.all([spotsForDate(profile, date), recentTitles(profile, date)]);
  await db().from("spots").update({ status: "swapped" }).eq("profile_id", profile.id).eq("date", date).eq("status", "active");
  return insertSpot(profile, date, await draftSpot(profile, date, [...all.map((s) => s.title), ...recent]));
}

export async function setSpotStatus(profile: Profile, id: string, status: "active" | "skipped") {
  const { data, error } = await db().from("spots").update({ status }).eq("id", id).eq("profile_id", profile.id).select().single();
  if (error) throw error;
  return toSpot(data);
}

// A contest theme becomes today's spot.
export async function spotFromContest(profile: Profile, date: string, contest: { id: string; name: string; theme: string }) {
  const weather = await dayWeather(profile.lat, profile.lng, profile.timezone, date);
  const golden = goldenWindow(weather.sunset);
  await db().from("spots").update({ status: "swapped" }).eq("profile_id", profile.id).eq("date", date).eq("status", "active");
  return insertSpot(
    profile,
    date,
    {
      title: contest.name,
      spotting: `Spotting ${contest.theme.toLowerCase()}`,
      habitat: contest.theme,
      best_from: golden.from,
      best_to: golden.to,
      nudge: "",
      contest_id: contest.id,
    },
    "contest",
  );
}
