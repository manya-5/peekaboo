import type { CSSProperties } from "react";
import { c } from "@/lib/theme";

type Look = "side" | "up" | "down" | "center";

type Props = {
  eyeW: number;
  eyeH: number;
  rim: number;
  pupilW: number;
  pupilH: number;
  gap?: number;
  look?: Look;
  inset?: number; // distance of the pupil from the rim
  label?: string;
  blink?: boolean;
  style?: CSSProperties;
};

// Boo: two tall oval eyes, white with a soft blue rim and a navy pupil.
export function BooEyes({ eyeW, eyeH, rim, pupilW, pupilH, gap = 3, look = "side", inset = 2, label, blink, style }: Props) {
  const place: CSSProperties =
    look === "side"
      ? { alignItems: "flex-end", justifyContent: "flex-end", padding: `0 ${inset}px ${inset}px 0` }
      : look === "up"
        ? { alignItems: "flex-start", justifyContent: "center", paddingTop: inset }
        : look === "down"
          ? { alignItems: "flex-end", justifyContent: "center", paddingBottom: inset }
          : { alignItems: "center", justifyContent: "center" };

  const eye: CSSProperties = {
    width: eyeW,
    height: eyeH,
    borderRadius: "50%",
    background: c.white,
    border: `${rim}px solid ${c.soft}`,
    boxSizing: "border-box",
    display: "flex",
    transition: "padding 400ms ease",
    ...place,
  };
  const pupil: CSSProperties = {
    width: pupilW,
    height: pupilH,
    borderRadius: "50%",
    background: c.pupil,
    display: "block",
  };

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={blink ? "boo-blink" : undefined}
      style={{ display: "flex", gap, ...style }}
    >
      <span style={eye}>
        <span style={pupil} className="boo-pupil" />
      </span>
      <span style={eye}>
        <span style={pupil} className="boo-pupil" />
      </span>
    </span>
  );
}
