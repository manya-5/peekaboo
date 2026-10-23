"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BooEyes } from "@/components/BooEyes";
import { CloseIcon, FlashIcon } from "@/components/Icons";
import { compressImage, frameFromVideo } from "@/lib/compress";
import { c } from "@/lib/theme";
import type { Spot } from "@/lib/types";

const roundBtn = {
  width: 44,
  height: 44,
  border: 0,
  borderRadius: "50%",
  background: c.cream,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;

type TorchCaps = MediaTrackCapabilities & { torch?: boolean };

export function ShootView({ initialSpot, latestUrl }: { initialSpot: Spot | null; latestUrl: string | null }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [live, setLive] = useState(false);
  const [torch, setTorch] = useState<{ supported: boolean; on: boolean }>({ supported: false, on: false });
  const [spot, setSpot] = useState(initialSpot);
  const [swapping, setSwapping] = useState(false);
  const [saving, setSaving] = useState<string | null>(null); // preview URL while saving
  const [error, setError] = useState<string | null>(null);

  // Live viewfinder when the browser allows it. If not, the shutter opens the
  // phone's own camera instead.
  useEffect(() => {
    let s: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 3840 }, height: { ideal: 2160 } },
        });
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        setStream(s);
        const caps = s.getVideoTracks()[0]?.getCapabilities?.() as TorchCaps | undefined;
        setTorch({ supported: Boolean(caps?.torch), on: false });
      } catch {
        setStream(null);
      }
    })();
    return () => {
      cancelled = true;
      s?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !stream) return;
    v.srcObject = stream;
    v.play().catch(() => {});
  }, [stream]);

  async function toggleTorch() {
    const track = stream?.getVideoTracks()[0];
    if (!track || !torch.supported) return;
    const on = !torch.on;
    try {
      await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
      setTorch({ supported: true, on });
    } catch {
      setTorch({ supported: false, on: false });
    }
  }

  async function save(raw: Blob) {
    setError(null);
    setSaving(URL.createObjectURL(raw));
    try {
      const file = await compressImage(raw);
      const form = new FormData();
      form.append("file", file, "photo.jpg");
      if (spot) form.append("spotId", spot.id);
      form.append("takenAt", new Date().toISOString());
      const res = await fetch("/api/photos", { method: "POST", body: form });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Couldn't save that one");
      stream?.getTracks().forEach((t) => t.stop());
      router.push(`/react/${j.id}`);
    } catch (e) {
      setSaving(null);
      setError(e instanceof Error ? e.message : "Couldn't save that one");
    }
  }

  async function shutter() {
    const v = videoRef.current;
    if (stream && v && live && v.videoWidth) {
      try {
        return save(await frameFromVideo(v));
      } catch {
        /* fall through to the native camera */
      }
    }
    cameraInput.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) save(f);
  }

  async function newSpot() {
    setSwapping(true);
    try {
      const res = await fetch("/api/spot/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ swap: true }),
      });
      if (res.ok) {
        const { spot: s } = await res.json();
        setSpot(s);
        router.replace(`/shoot?spot=${s.id}`, { scroll: false });
      }
    } finally {
      setSwapping(false);
    }
  }

  const pill = saving ? "Got it" : swapping ? "Finding a new one..." : spot ? spot.spotting : "Anything you like";

  return (
    <main className="screen" style={{ overflow: "hidden", height: "100dvh", minHeight: 0, background: "#1F1E1B", color: c.ink }}>
      {/* Viewfinder */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 194, overflow: "hidden" }}>
        {stream && (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            onPlaying={() => setLive(true)}
            aria-label="Camera view"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {!stream && !saving && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 48px 40px",
              textAlign: "center",
              color: "#CFC8BA",
              fontSize: 15,
              fontWeight: 300,
              lineHeight: 1.4,
            }}
          >
            Tap the button to open your camera, or pick one from your photos.
          </div>
        )}
        {saving && (
          <img src={saving} alt="Your photo" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: "max(18px, env(safe-area-inset-top))",
          display: "grid",
          gridTemplateColumns: "44px 1fr 44px",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <button type="button" aria-label="Close camera" style={roundBtn} onClick={() => (history.length > 1 ? router.back() : router.push("/"))}>
          <CloseIcon />
        </button>
        <div
          aria-live="polite"
          style={{
            justifySelf: "center",
            background: c.cream,
            color: c.ink,
            fontSize: 15,
            fontWeight: 500,
            padding: "9px 16px",
            borderRadius: 999,
            maxWidth: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {pill}
        </div>
        <button
          type="button"
          aria-label={torch.on ? "Flash on" : "Flash off"}
          aria-pressed={torch.on}
          aria-disabled={!torch.supported}
          onClick={toggleTorch}
          style={{ ...roundBtn, opacity: torch.supported ? 1 : 0.55 }}
        >
          <FlashIcon on={torch.on} />
        </button>
      </div>

      {/* Bottom sheet */}
      <section
        aria-label="Camera controls"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "calc(226px + env(safe-area-inset-bottom))",
          background: c.cream,
          borderRadius: "30px 30px 0 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            marginTop: -26,
            width: 86,
            height: 44,
            background: c.cream,
            borderRadius: "43px 43px 0 0",
            display: "flex",
            justifyContent: "center",
            paddingTop: 7,
          }}
        >
          <BooEyes eyeW={24} eyeH={34} rim={2.5} pupilW={10} pupilH={14} look="up" inset={3} label="Boo peeking up at your photo" blink />
        </div>
        <div role="status" style={{ marginTop: 10, fontSize: 16, fontWeight: 400, color: error ? c.action : c.muted }}>
          {error ?? (saving ? "Ooh, let me see" : "Go on, I'm watching")}
        </div>
        <div
          style={{
            marginTop: "auto",
            width: "100%",
            padding: "0 40px calc(36px + env(safe-area-inset-bottom)) 40px",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          <button
            type="button"
            aria-label="Pick from your photos"
            disabled={Boolean(saving)}
            onClick={() => libraryInput.current?.click()}
            style={{
              width: 50,
              height: 50,
              border: "4px solid #FFFFFF",
              borderRadius: "50%",
              padding: 0,
              overflow: "hidden",
              background: "#FFFFFF",
              boxShadow: "0 3px 8px rgba(70, 60, 40, 0.14)",
              cursor: "pointer",
            }}
          >
            {latestUrl && <img src={latestUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
          </button>
          <button
            type="button"
            aria-label="Take photo"
            disabled={Boolean(saving)}
            onClick={shutter}
            style={{
              width: 78,
              height: 78,
              border: `2px solid ${c.action}`,
              borderRadius: "50%",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span className={saving ? "pulse" : undefined} style={{ width: 64, height: 64, borderRadius: "50%", background: c.action, display: "block" }} />
          </button>
          {spot ? (
            <button
              type="button"
              onClick={newSpot}
              disabled={swapping || Boolean(saving)}
              style={{ border: 0, background: "transparent", padding: "10px 4px", fontFamily: "inherit", fontSize: 14, color: c.action, cursor: "pointer" }}
            >
              New spot
            </button>
          ) : (
            <span />
          )}
        </div>
      </section>

      <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      <input ref={libraryInput} type="file" accept="image/*" hidden onChange={onFile} />
    </main>
  );
}
