"use client";

import { useEffect, useState } from "react";
import { c } from "@/lib/theme";
import { hourLabel, nowLabel, partsIn, toMinutes } from "@/lib/time";

// Now versus the best-light window. The bar spans from one window-length before
// the window to half a window after it, which is how the design lays out 4 to 6.
export function LightBar({ bestFrom, bestTo, tz }: { bestFrom: string; bestTo: string; tz: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const p = partsIn(tz);
      setNow(p.hour * 60 + p.minute);
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, [tz]);

  const from = toMinutes(bestFrom);
  const to = toMinutes(bestTo);
  const len = Math.max(30, to - from);
  const start = from - len;
  const span = len * 2.5;
  const pct = (m: number) => Math.min(100, Math.max(0, ((m - start) / span) * 100));
  const label = `Best light, ${hourLabel(bestFrom)} to ${hourLabel(bestTo)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 400, color: c.muted2 }}>
        <span suppressHydrationWarning>{now == null ? " " : `Now, ${nowLabel(now)}`}</span>
        <span>{label}</span>
      </div>
      <div
        role="img"
        aria-label={`${label}${now != null ? `; it is ${nowLabel(now)} now` : ""}`}
        style={{ position: "relative", height: 8, borderRadius: 999, background: c.track }}
      >
        <span
          style={{
            position: "absolute",
            left: `${pct(from)}%`,
            width: `${pct(to) - pct(from)}%`,
            top: 0,
            bottom: 0,
            borderRadius: 999,
            background: c.yellow,
            display: "block",
          }}
        />
        {now != null && (
          <span
            style={{
              position: "absolute",
              left: `${pct(now)}%`,
              top: "50%",
              width: 14,
              height: 14,
              margin: "-7px 0 0 -7px",
              borderRadius: "50%",
              background: c.action,
              border: `3px solid ${c.cream}`,
              boxSizing: "content-box",
              display: "block",
              transition: "left 600ms ease",
            }}
          />
        )}
      </div>
    </div>
  );
}
