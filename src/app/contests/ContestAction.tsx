"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SmallOutlineButton } from "@/components/Buttons";
import { c } from "@/lib/theme";

type C = { id: string; name: string; url: string | null; isSample: boolean };

// Enter opens the contest's own page; Boo never enters for her.
// Shoot turns the contest theme into today's spot.
export function ContestAction({ contest, matched }: { contest: C; matched: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(false);

  async function shoot() {
    setBusy(true);
    const res = await fetch("/api/spot/from-contest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contestId: contest.id }),
    });
    const j = res.ok ? await res.json() : null;
    router.push(j?.spot ? `/shoot?spot=${j.spot.id}` : "/shoot");
  }

  function enter() {
    if (contest.url) window.open(contest.url, "_blank", "noopener");
    else setNote(true);
  }

  return (
    <div style={{ position: "relative" }}>
      {matched ? (
        <SmallOutlineButton onClick={enter} aria-label={`Enter ${contest.name}`}>
          Enter
        </SmallOutlineButton>
      ) : (
        <SmallOutlineButton onClick={shoot} disabled={busy} aria-label={`Shoot for ${contest.name}`}>
          Shoot
        </SmallOutlineButton>
      )}
      {note && (
        <span
          role="status"
          className="fade-in"
          style={{
            position: "absolute",
            right: 0,
            top: 42,
            width: 150,
            fontSize: 12,
            lineHeight: 1.3,
            color: c.muted2,
            textAlign: "right",
          }}
        >
          Sample contest, so there&apos;s nowhere to enter yet.
        </span>
      )}
    </div>
  );
}
