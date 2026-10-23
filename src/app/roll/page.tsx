import { BottomNav } from "@/components/BottomNav";
import { PhotoGrid, type GridItem } from "@/components/PhotoGrid";
import { getProfile, monthPhotos } from "@/lib/data";
import { c } from "@/lib/theme";
import { monthName, todayIn } from "@/lib/time";
import { RollNote } from "./RollNote";

export const dynamic = "force-dynamic";

export default async function RollPage({ searchParams }: PageProps<"/roll">) {
  const { new: newId } = await searchParams;
  const profile = await getProfile();
  const today = todayIn(profile.timezone);
  const photos = await monthPhotos(profile, today);
  const fresh = typeof newId === "string" && photos[0]?.id === newId ? newId : null;

  const items: GridItem[] = photos.map((photo, i) => ({ kind: "photo", photo, justNow: i === 0 && Boolean(fresh) }));
  const n = photos.length;

  return (
    <main className="screen" style={{ color: c.ink }}>
      <header style={{ padding: "44px 22px 0 22px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 4 }}>
        <h1 style={{ margin: 0, fontWeight: 500, fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1.05 }}>Day {Number(today.slice(8, 10))}, on the roll</h1>
        <div style={{ fontSize: 16, fontWeight: 300, color: c.muted }}>
          {n ? `${n} ${n === 1 ? "thing" : "things"} you noticed this ${monthName(today)}` : `Nothing on the roll yet this ${monthName(today)}`}
        </div>
      </header>

      <section aria-label={`${monthName(today)}, newest first`} style={{ padding: "30px 30px 0 30px" }}>
        <PhotoGrid items={items} tz={profile.timezone} rowGap={18} from="roll" label={`${monthName(today)} photos`} />
      </section>

      {fresh && <RollNote photoId={fresh} />}

      <div style={{ height: 28 }} />
      <BottomNav />
    </main>
  );
}
