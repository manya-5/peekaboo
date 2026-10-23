import "server-only";
import { BUCKET, db, hasDb } from "./supabase";
import { PROFILE_ID, SAMPLE_CONTESTS, SAMPLE_MATCHES, SAMPLE_PHOTOS, SAMPLE_PROFILE } from "./sample";
import { monthStart, addDays, todayIn } from "./time";
import type { Contest, ContestWithMatch, Photo, Profile, Spot } from "./types";

type Row = Record<string, unknown>;

const hhmm = (t: unknown) => (typeof t === "string" ? t.slice(0, 5) : "");

export function toProfile(r: Row): Profile {
  return {
    id: r.id as string,
    name: r.name as string,
    city: (r.city as string) ?? null,
    lat: (r.lat as number) ?? null,
    lng: (r.lng as number) ?? null,
    timezone: (r.timezone as string) || "America/New_York",
    sharedContext: (r.shared_context as string) ?? null,
    sassLevel: (r.sass_level as number) ?? 2,
    quietFrom: r.quiet_from ? hhmm(r.quiet_from) : null,
    quietTo: r.quiet_to ? hhmm(r.quiet_to) : null,
  };
}

export function toSpot(r: Row): Spot {
  return {
    id: r.id as string,
    date: r.date as string,
    title: r.title as string,
    spotting: (r.spotting as string) || (r.title as string),
    habitat: r.habitat as string,
    bestFrom: hhmm(r.best_from),
    bestTo: hhmm(r.best_to),
    nudge: (r.nudge as string) ?? null,
    source: r.source as Spot["source"],
    contestId: (r.contest_id as string) ?? null,
    status: r.status as Spot["status"],
  };
}

function toPhoto(r: Row, url: string): Photo {
  return {
    id: r.id as string,
    takenAt: r.taken_at as string,
    url,
    spotId: (r.spot_id as string) ?? null,
    what: (r.what as string) ?? null,
    tags: (r.tags as string[]) ?? [],
    booReaction: (r.boo_reaction as string[]) ?? null,
    craftNote: (r.craft_note as string) ?? null,
    repeatOf: (r.repeat_of as string[]) ?? [],
    kept: Boolean(r.kept),
  };
}

function toContest(r: Row): Contest {
  return {
    id: r.id as string,
    name: r.name as string,
    theme: r.theme as string,
    description: (r.description as string) ?? null,
    deadline: r.deadline as string,
    url: (r.url as string) ?? null,
    isSample: Boolean(r.is_sample),
  };
}

// ---------- Images ----------

export async function signUrls(paths: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const toSign = paths.filter((p) => p && !p.startsWith("/"));
  paths.filter((p) => p?.startsWith("/")).forEach((p) => (out[p] = p));
  if (!toSign.length) return out;
  const { data, error } = await db().storage.from(BUCKET).createSignedUrls(toSign, 60 * 60 * 6);
  if (error) throw error;
  data?.forEach((d) => {
    if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  });
  return out;
}

async function withUrls(rows: Row[]): Promise<Photo[]> {
  const urls = await signUrls(rows.map((r) => r.storage_path as string));
  return rows.map((r) => toPhoto(r, urls[r.storage_path as string] ?? ""));
}

// ---------- Profile ----------

export async function getProfile(): Promise<Profile> {
  if (!hasDb()) return toProfile(SAMPLE_PROFILE);
  const { data, error } = await db().from("profile").select("*").eq("id", PROFILE_ID).single();
  if (error) throw error;
  return toProfile(data);
}

// ---------- Photos ----------

const samplePhotos = (): Photo[] =>
  [...SAMPLE_PHOTOS]
    .reverse()
    .map((p) => toPhoto({ ...p, kept: true, storage_path: `/images/${p.file}` }, `/images/${p.file}`));

// Kept photos in the month containing `dayIso`, newest first.
export async function monthPhotos(profile: Profile, dayIso: string): Promise<Photo[]> {
  if (!hasDb()) return samplePhotos();
  const start = monthStart(dayIso);
  const nextMonth = monthStart(addDays(start, 32));
  // Dates are local to the profile, so pad the window and filter after.
  const { data, error } = await db()
    .from("photos")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("kept", true)
    .gte("taken_at", `${addDays(start, -1)}T00:00:00Z`)
    .lt("taken_at", `${addDays(nextMonth, 1)}T00:00:00Z`)
    .order("taken_at", { ascending: false });
  if (error) throw error;
  const inMonth = (data ?? []).filter((r) => todayIn(profile.timezone, new Date(r.taken_at)).slice(0, 7) === dayIso.slice(0, 7));
  return withUrls(inMonth);
}

export async function latestPhoto(profile: Profile): Promise<Photo | null> {
  if (!hasDb()) return samplePhotos()[0];
  const { data } = await db()
    .from("photos")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("kept", true)
    .order("taken_at", { ascending: false })
    .limit(1);
  if (!data?.length) return null;
  return (await withUrls(data))[0];
}

export async function getPhoto(id: string): Promise<Photo | null> {
  if (!hasDb()) return samplePhotos().find((p) => p.id === id) ?? null;
  const { data } = await db().from("photos").select("*").eq("id", id).eq("profile_id", PROFILE_ID).maybeSingle();
  if (!data) return null;
  return (await withUrls([data]))[0];
}

export async function getPhotos(ids: string[]): Promise<Photo[]> {
  if (!ids.length) return [];
  if (!hasDb()) return samplePhotos().filter((p) => ids.includes(p.id));
  const { data } = await db().from("photos").select("*").in("id", ids).eq("profile_id", PROFILE_ID);
  return withUrls((data ?? []).sort((a, b) => (a.taken_at < b.taken_at ? -1 : 1)));
}

export async function getPhotoRow(id: string) {
  const { data } = await db().from("photos").select("*").eq("id", id).eq("profile_id", PROFILE_ID).maybeSingle();
  return data;
}

// Last N kept photos as plain text context for the AI (no images).
export async function recentPhotoContext(profile: Profile, limit = 30, excludeId?: string) {
  if (!hasDb()) return SAMPLE_PHOTOS.map((p) => ({ id: p.id, date: p.taken_at.slice(0, 10), what: p.what, tags: p.tags }));
  let q = db()
    .from("photos")
    .select("id, taken_at, what, tags")
    .eq("profile_id", profile.id)
    .eq("kept", true)
    .order("taken_at", { ascending: false })
    .limit(limit);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    date: todayIn(profile.timezone, new Date(r.taken_at)),
    what: r.what as string | null,
    tags: (r.tags as string[]) ?? [],
  }));
}

// ---------- Spots ----------

export async function getActiveSpot(profile: Profile, date: string): Promise<Spot | null> {
  if (!hasDb()) return null;
  const { data } = await db()
    .from("spots")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("date", date)
    .order("created_at", { ascending: false });
  if (!data?.length) return null;
  // The newest spot for the day decides: active shows, skipped hides.
  return toSpot(data[0]);
}

export async function getSpot(id: string): Promise<Spot | null> {
  if (!hasDb()) return null;
  const { data } = await db().from("spots").select("*").eq("id", id).eq("profile_id", PROFILE_ID).maybeSingle();
  return data ? toSpot(data) : null;
}

export async function spotsForDate(profile: Profile, date: string): Promise<Spot[]> {
  if (!hasDb()) return [];
  const { data } = await db().from("spots").select("*").eq("profile_id", profile.id).eq("date", date);
  return (data ?? []).map(toSpot);
}

// ---------- Contests ----------

export async function openContests(today: string): Promise<Contest[]> {
  if (!hasDb()) return SAMPLE_CONTESTS.map(toContest);
  const { data, error } = await db().from("contests").select("*").gte("deadline", today).order("deadline");
  if (error) throw error;
  return (data ?? []).map(toContest);
}

export async function contestsWithMatches(today: string): Promise<ContestWithMatch[]> {
  if (!hasDb()) {
    const photos = samplePhotos();
    return SAMPLE_CONTESTS.map((r) => {
      const m = SAMPLE_MATCHES.find((x) => x.contest_id === r.id);
      const p = m && photos.find((x) => x.id === m.photo_id);
      return {
        ...toContest(r),
        match: p ? { photoId: p.id, photoUrl: p.url, what: p.what, reason: m!.reason } : null,
      };
    });
  }
  const contests = await openContests(today);
  if (!contests.length) return [];
  const { data, error } = await db()
    .from("contest_matches")
    .select("contest_id, reason, confidence, created_at, photos!inner(id, storage_path, what, kept, profile_id)")
    .in(
      "contest_id",
      contests.map((x) => x.id),
    )
    .eq("photos.kept", true)
    .eq("photos.profile_id", PROFILE_ID)
    .order("created_at", { ascending: false });
  if (error) throw error;
  type M = { contest_id: string; reason: string; confidence: number; photos: Row };
  const rows = (data ?? []) as unknown as M[];
  // Newest match wins, so a fresh photo shows up as soon as it lands.
  const best = new Map<string, M>();
  for (const r of rows) if (!best.has(r.contest_id)) best.set(r.contest_id, r);
  const urls = await signUrls([...best.values()].map((m) => m.photos.storage_path as string));
  return contests.map((ct) => {
    const m = best.get(ct.id);
    return {
      ...ct,
      match: m
        ? {
            photoId: m.photos.id as string,
            photoUrl: urls[m.photos.storage_path as string] ?? "",
            what: (m.photos.what as string) ?? null,
            reason: m.reason,
          }
        : null,
    };
  });
}
