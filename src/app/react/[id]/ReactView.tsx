"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BooEyes } from "@/components/BooEyes";
import { OutlineButton, PrimaryButton, TextButton } from "@/components/Buttons";
import { Sticker } from "@/components/Sticker";
import { c } from "@/lib/theme";
import { dateList, shortDate } from "@/lib/time";
import type { Photo } from "@/lib/types";

export type Past = { id: string; url: string; date: string };

type Reaction = { lines: string[]; craftNote: string | null; past: Past[] };

export function ReactView({ photo, past, stamp }: { photo: Photo; past: Past[]; stamp: string }) {
  const router = useRouter();
  const [reaction, setReaction] = useState<Reaction | null>(
    photo.booReaction?.length ? { lines: photo.booReaction, craftNote: photo.craftNote, past } : null,
  );
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<"keep" | "retake" | null>(null);
  const asked = useRef(false);

  const ask = useCallback(async () => {
    setFailed(false);
    try {
      const res = await fetch("/api/photo/react", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ photoId: photo.id }),
      });
      if (!res.ok) throw new Error();
      const j = await res.json();
      setReaction({ lines: j.lines, craftNote: j.craft_note, past: j.past ?? [] });
    } catch {
      setFailed(true);
    }
  }, [photo.id]);

  useEffect(() => {
    if (reaction || asked.current) return;
    asked.current = true;
    ask();
  }, [reaction, ask]);

  async function keep() {
    setBusy("keep");
    const res = await fetch(`/api/photos/${photo.id}/keep`, { method: "POST" });
    if (res.ok) router.push(`/roll?new=${photo.id}`);
    else setBusy(null);
  }

  async function retake() {
    setBusy("retake");
    await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
    router.replace(photo.spotId ? `/shoot?spot=${photo.spotId}` : "/shoot");
  }

  const looking = !reaction && !failed;
  const repeat = reaction?.past ?? [];

  return (
    <main className="screen" style={{ alignItems: "center", color: c.ink }}>
      <div style={{ height: 56, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 300, letterSpacing: "0.02em", color: c.muted2 }}>
        {stamp}
      </div>

      <section aria-label="Your photo" style={{ position: "relative", marginTop: 34 }}>
        <div className={looking ? "boo-looking" : undefined} style={{ position: "absolute", left: "50%", top: -30, transform: "translateX(-50%)", zIndex: 2 }}>
          <BooEyes
            eyeW={30}
            eyeH={44}
            rim={2.5}
            pupilW={12}
            pupilH={17}
            look={looking || repeat.length ? "up" : "down"}
            inset={4}
            label={looking ? "Boo looking at your photo" : repeat.length ? "Boo rolling its eyes" : "Boo admiring your photo"}
            blink={!looking}
          />
        </div>
        <Sticker
          src={photo.url}
          alt={photo.what ? `Your photo: ${photo.what}` : "Your photo"}
          size={240}
          height={300}
          shape="arch"
          border={9}
          radiusOverride="999px 999px 20px 20px"
          shadow="0 10px 24px rgba(70, 60, 40, 0.14)"
        />
      </section>

      <div aria-live="polite" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {reaction ? (
          <div key="r" className="fade-in" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6, padding: "0 30px" }}>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>{reaction.lines[0]}</h1>
              {reaction.lines[1] && <p style={{ margin: 0, fontSize: 17, fontWeight: 300, lineHeight: 1.35, color: c.muted }}>{reaction.lines[1]}</p>}
            </div>

            {repeat.length > 0 && (
              <div
                role="group"
                aria-label={`Your other photos like this: ${repeat.map((p) => shortDate(p.date)).join(", ")}`}
                style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}
              >
                <div style={{ display: "flex" }}>
                  {repeat.slice(-4).map((p, i) => (
                    <img
                      key={p.id}
                      src={p.url}
                      alt={shortDate(p.date)}
                      style={{
                        width: 44,
                        height: 44,
                        objectFit: "cover",
                        border: "3px solid #FFFFFF",
                        borderRadius: "50%",
                        marginLeft: i ? -12 : 0,
                        display: "block",
                        background: "#FFFFFF",
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: 400, color: c.muted2 }}>{dateList(repeat.slice(-4).map((p) => p.date))}</span>
              </div>
            )}

            {reaction.craftNote && (
              <p style={{ margin: "22px 30px 0 30px", textAlign: "center", fontSize: 17, fontWeight: 400, lineHeight: 1.35, color: c.action }}>
                {reaction.craftNote}
              </p>
            )}
          </div>
        ) : failed ? (
          <div style={{ marginTop: 30, textAlign: "center", padding: "0 30px" }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.1 }}>I blinked.</h1>
            <p style={{ margin: "6px 0 0", fontSize: 17, fontWeight: 300, color: c.muted }}>Couldn&apos;t get a good look. You can still keep it.</p>
            <TextButton onClick={ask}>Look again</TextButton>
          </div>
        ) : (
          <div style={{ marginTop: 30, textAlign: "center", padding: "0 30px" }}>
            <h1 className="pulse" style={{ margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.1, color: c.muted2 }}>
              Let me have a look
            </h1>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "auto",
          width: "100%",
          padding: "28px 22px calc(30px + env(safe-area-inset-bottom)) 22px",
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <OutlineButton onClick={retake} disabled={busy != null}>
          Retake
        </OutlineButton>
        <PrimaryButton onClick={keep} disabled={busy != null}>
          {busy === "keep" ? "Keeping..." : "Keep it"}
        </PrimaryButton>
      </div>
    </main>
  );
}
