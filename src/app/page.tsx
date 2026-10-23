import { BottomNav } from "@/components/BottomNav";
import { PhotoGrid, type GridItem } from "@/components/PhotoGrid";
import { SpotCard } from "@/components/SpotCard";
import { Wordmark } from "@/components/Wordmark";
import { getProfile, monthPhotos } from "@/lib/data";
import { ensureSpot } from "@/lib/spot";
import { c } from "@/lib/theme";
import { headerDate, monthName, todayIn } from "@/lib/time";
import type { Spot } from "@/lib/types";

export const dynamic = "force-dynamic";

const SAMPLE_SPOT: Spot = {
  id: "sample",
  date: "",
  title: "Find a long shadow",
  spotting: "Spotting a long shadow",
  habitat: "Sidewalks, stairs",
  bestFrom: "16:00",
  bestTo: "18:00",
  nudge: null,
  source: "daily",
  contestId: null,
  status: "active",
};

export default async function Home() {
  const profile = await getProfile();
  const today = todayIn(profile.timezone);
  const [spot, photos] = await Promise.all([
    ensureSpot(profile, today).catch((e) => {
      console.error(e);
      return null;
    }),
    monthPhotos(profile, today),
  ]);
  const shown = spot ?? { ...SAMPLE_SPOT, date: today };

  const hasToday = photos.length > 0 && todayIn(profile.timezone, new Date(photos[0].takenAt)) === today;
  const items: GridItem[] = [
    ...(hasToday ? [] : [{ kind: "today" as const, href: shown.id === "sample" ? "/shoot" : `/shoot?spot=${shown.id}` }]),
    ...photos.map((photo) => ({ kind: "photo" as const, photo })),
  ];

  return (
    <main className="screen" style={{ color: c.ink }}>
      <header style={{ padding: "26px 22px 0 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Wordmark />
        <div style={{ fontSize: 13, fontWeight: 400, color: c.muted2, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>
          {headerDate(today)}
        </div>
      </header>

      <SpotCard initial={shown} name={profile.name} tz={profile.timezone} />

      <section aria-label={`${monthName(today)}, newest first`} style={{ padding: "22px 30px 28px 30px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={{ margin: 0, fontWeight: 500, fontSize: 20, letterSpacing: "-0.01em", color: c.ink }}>{monthName(today)}</h2>
          <span style={{ fontSize: 14, fontWeight: 300, color: c.muted2 }}>
            {photos.length ? `${photos.length} so far` : "A fresh month"}
          </span>
        </div>
        <PhotoGrid items={items} tz={profile.timezone} from="home" label={`${monthName(today)} photos`} />
      </section>

      <BottomNav />
    </main>
  );
}
