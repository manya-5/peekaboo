import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { PhotoGrid, type GridItem } from "@/components/PhotoGrid";
import { getProfile, monthPhotos, photoMonths, recentPhotos } from "@/lib/data";
import { c } from "@/lib/theme";
import { monthName, todayIn } from "@/lib/time";
import { RollNote } from "./RollNote";

export const dynamic = "force-dynamic";

const RECENT = "recent";

export default async function RollPage({ searchParams }: PageProps<"/roll">) {
  const { new: newId, view: rawView } = await searchParams;
  const profile = await getProfile();
  const today = todayIn(profile.timezone);
  const thisMonth = today.slice(0, 7);

  // Tabs: last 30 days, then every month with photos (this month always shown), newest first.
  const months = [...new Set([thisMonth, ...(await photoMonths(profile))])].sort().reverse();
  const view = typeof rawView === "string" && months.includes(rawView) ? rawView : RECENT;
  const isRecent = view === RECENT;

  const photos = isRecent ? await recentPhotos(profile, today, 30) : await monthPhotos(profile, `${view}-01`);
  const fresh = typeof newId === "string" && photos[0]?.id === newId ? newId : null;

  const items: GridItem[] = photos.map((photo, i) => ({ kind: "photo", photo, justNow: i === 0 && Boolean(fresh) }));
  const n = photos.length;

  const monthLabel = (m: string) => {
    const name = monthName(`${m}-01`);
    return m.slice(0, 4) === today.slice(0, 4) ? name : `${name} ${m.slice(0, 4)}`;
  };
  const periodLabel = isRecent ? "the last 30 days" : monthLabel(view);
  const title = isRecent ? `Day ${Number(today.slice(8, 10))}, on the roll` : `${monthLabel(view)}, on the roll`;
  const subtitle = n
    ? `${n} ${n === 1 ? "thing" : "things"} you noticed in ${periodLabel}`
    : `Nothing on the roll in ${periodLabel}`;

  const tabs = [{ key: RECENT, label: "Last 30 days" }, ...months.map((m) => ({ key: m, label: monthLabel(m) }))];

  return (
    <main className="screen" style={{ color: c.ink }}>
      <header style={{ padding: "44px 22px 0 22px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 4 }}>
        <h1 style={{ margin: 0, fontWeight: 500, fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{title}</h1>
        <div style={{ fontSize: 16, fontWeight: 300, color: c.muted }}>{subtitle}</div>
      </header>

      <nav
        aria-label="Choose what to show"
        style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, padding: "22px 22px 0 22px" }}
      >
        {tabs.map((t) => {
          const active = t.key === view;
          return (
            <Link
              key={t.key}
              href={t.key === RECENT ? "/roll" : `/roll?view=${t.key}`}
              aria-current={active ? "page" : undefined}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: active ? 500 : 400,
                textDecoration: "none",
                color: active ? c.white : c.chipText,
                background: active ? c.action : "transparent",
                border: `1px solid ${active ? c.action : c.chipBorder}`,
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <section aria-label={`${periodLabel}, newest first`} style={{ padding: "26px 30px 0 30px" }}>
        <PhotoGrid items={items} tz={profile.timezone} rowGap={18} from="roll" label={`Photos from ${periodLabel}`} />
      </section>

      {fresh && <RollNote photoId={fresh} />}

      <div style={{ height: 28 }} />
      <BottomNav />
    </main>
  );
}
