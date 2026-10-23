"use client";

import Link from "next/link";
import { useState } from "react";
import { c } from "@/lib/theme";
import type { Spot } from "@/lib/types";
import { DashedCard } from "./DashedCard";
import { CameraIcon, StairsIcon } from "./Icons";
import { LightBar } from "./LightBar";
import { TextButton } from "./Buttons";

export function SpotCard({ initial, name, tz }: { initial: Spot; name: string; tz: string }) {
  const [spot, setSpot] = useState(initial);
  const [busy, setBusy] = useState<"swap" | "skip" | null>(null);
  const sample = spot.id === "sample";

  async function swap() {
    if (sample) return;
    setBusy("swap");
    try {
      const res = await fetch("/api/spot/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ swap: true }),
      });
      if (res.ok) setSpot((await res.json()).spot);
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(status: "active" | "skipped") {
    const prev = spot;
    setSpot({ ...spot, status }); // instant, no waiting
    if (sample) return;
    const res = await fetch(`/api/spot/${spot.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setSpot(prev);
  }

  if (spot.status === "skipped") {
    return (
      <div
        className="fade-in"
        style={{
          margin: "24px 22px 0 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 14,
          color: c.muted2,
          padding: "0 4px 0 20px",
        }}
      >
        <span>No spot today. Shoot anything, any time.</span>
        <TextButton onClick={() => setStatus("active")}>Bring it back</TextButton>
      </div>
    );
  }

  return (
    <DashedCard label="Today's spot" style={{ margin: "24px 22px 0 22px", padding: "20px 18px 10px 20px", gap: 14 }}>
      <div key={spot.id} className={spot.id !== initial.id ? "fade-in" : undefined} style={{ display: "flex", flexDirection: "column", gap: 4, opacity: busy === "swap" ? 0.4 : 1, transition: "opacity 200ms" }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: c.action }}>Psst, {name}</div>
        <div style={{ fontSize: 34, fontWeight: 500, lineHeight: 1, letterSpacing: "-0.03em", color: c.ink }}>{spot.title}</div>
      </div>

      <LightBar bestFrom={spot.bestFrom} bestTo={spot.bestTo} tz={tz} />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: `1px solid ${c.chipBorder}`,
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 13,
            color: c.chipText,
          }}
        >
          <StairsIcon />
          {spot.habitat}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 4, alignItems: "center" }}>
        <Link
          href={sample ? "/shoot" : `/shoot?spot=${spot.id}`}
          style={{
            height: 48,
            borderRadius: 999,
            background: c.action,
            color: c.white,
            fontSize: 16,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <CameraIcon />I spotted one
        </Link>
        <TextButton onClick={swap} disabled={busy != null}>
          {busy === "swap" ? "Hmm..." : "Swap"}
        </TextButton>
        <TextButton onClick={() => setStatus("skipped")} disabled={busy != null}>
          Not today
        </TextButton>
      </div>
    </DashedCard>
  );
}
