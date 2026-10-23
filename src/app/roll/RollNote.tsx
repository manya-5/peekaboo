"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BooEyes } from "@/components/BooEyes";
import { DashedCard } from "@/components/DashedCard";
import { TextButton } from "@/components/Buttons";
import { c } from "@/lib/theme";

// After a photo is kept, Boo checks it against open contests and only
// speaks up if there's a fit. It never enters anything.
export function RollNote({ photoId }: { photoId: string }) {
  const [note, setNote] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    fetch("/api/contests/match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ photoId }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.note && setNote(j.note))
      .catch(() => {});
  }, [photoId]);

  if (!note || hidden) return null;

  return (
    <DashedCard
      label="A note from Boo"
      radius={24}
      style={{ margin: "34px 22px 0 22px", padding: "16px 18px 8px 18px", alignItems: "center", textAlign: "center", gap: 8 }}
    >
      <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <BooEyes eyeW={18} eyeH={26} rim={2} pupilW={7} pupilH={10} gap={2} />
        <p style={{ margin: 0, fontSize: 19, fontWeight: 400, lineHeight: 1.3 }}>{note}</p>
        <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 14, color: c.muted2 }}>
          <Link href="/contests" style={{ padding: "8px 4px", fontSize: 14, color: c.action, textDecoration: "none" }}>
            Show me
          </Link>
          <span aria-hidden="true">·</span>
          <TextButton onClick={() => setHidden(true)} style={{ padding: "8px 4px" }}>
            Maybe later
          </TextButton>
        </div>
      </div>
    </DashedCard>
  );
}
