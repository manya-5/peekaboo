import { BottomNav } from "@/components/BottomNav";
import { PlusIcon } from "@/components/Icons";
import { Sticker } from "@/components/Sticker";
import { contestsWithMatches, getProfile } from "@/lib/data";
import { c, type Shape } from "@/lib/theme";
import { timeLeft, todayIn } from "@/lib/time";
import { ContestAction } from "./ContestAction";

export const dynamic = "force-dynamic";

const ROW_SHAPES: { shape: Shape; radius: string }[] = [
  { shape: "arch", radius: "999px 999px 12px 12px" },
  { shape: "circle", radius: "50%" },
  { shape: "round18", radius: "18px" },
];

export default async function ContestsPage() {
  const profile = await getProfile();
  const today = todayIn(profile.timezone);
  const contests = await contestsWithMatches(today);

  return (
    <main className="screen" style={{ color: c.ink }}>
      <header style={{ padding: "34px 22px 0 22px" }}>
        <h1 style={{ margin: 0, fontWeight: 500, fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1.05 }}>Contests</h1>
      </header>

      <section aria-label="Open contests" style={{ padding: "22px 22px 28px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        {contests.length === 0 && (
          <p style={{ margin: 0, fontSize: 16, fontWeight: 300, color: c.muted }}>No open contests right now. I&apos;ll keep an eye out.</p>
        )}
        {contests.map((ct, i) => {
          const s = ROW_SHAPES[i % ROW_SHAPES.length];
          return (
            <article
              key={ct.id}
              style={{
                background: c.white,
                borderRadius: 22,
                padding: 14,
                display: "grid",
                gridTemplateColumns: "76px 1fr auto",
                gap: 14,
                alignItems: "center",
              }}
            >
              {ct.match ? (
                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Sticker
                    src={ct.match.photoUrl}
                    alt={`Your photo: ${ct.match.what ?? "a match"}`}
                    size={72}
                    shape={s.shape}
                    radiusOverride={s.radius}
                    border={4}
                    borderColor={c.cream}
                    shadow={false}
                  />
                  <span
                    title={ct.match.reason ?? undefined}
                    style={{
                      marginTop: -10,
                      position: "relative",
                      background: c.action,
                      color: c.white,
                      borderRadius: 999,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    You have this
                  </span>
                </div>
              ) : (
                <div
                  role="img"
                  aria-label="No photo yet"
                  style={{
                    width: 72,
                    height: 72,
                    border: `1.5px dashed ${c.soft}`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    justifySelf: "center",
                  }}
                >
                  <PlusIcon />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, lineHeight: 1.15 }}>{ct.name}</h2>
                <span style={{ fontSize: 14, fontWeight: 300, color: c.muted }}>{ct.theme}</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: c.action }}>{timeLeft(today, ct.deadline)}</span>
              </div>
              <ContestAction contest={{ id: ct.id, name: ct.name, url: ct.url, isSample: ct.isSample }} matched={Boolean(ct.match)} />
            </article>
          );
        })}
      </section>

      <BottomNav />
    </main>
  );
}
