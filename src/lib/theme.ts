export const c = {
  cream: "#F8F5EE",
  outside: "#E9E6DF",
  ink: "#2B2B2B",
  muted: "#5E5A52",
  muted2: "#6E6A62",
  chipText: "#3F3B35",
  chipBorder: "#DCD4C5",
  track: "#ECE5D8",
  soft: "#5F8BC9",
  action: "#4A72B0",
  yellow: "#F7C948",
  pupil: "#2B3A55",
  white: "#FFFFFF",
};

export const stickerShadow = "0 4px 10px rgba(70, 60, 40, 0.14)";

// Sticker shapes in the order the designs place them by grid slot.
export type Shape = "arch" | "round20" | "circle" | "round18";

export const radius: Record<Shape, string> = {
  arch: "999px 999px 14px 14px",
  round20: "20px",
  circle: "50%",
  round18: "18px",
};

export const SLOT_PATTERN: { shape: Shape; rotate: number }[] = [
  { shape: "arch", rotate: 2 },
  { shape: "round20", rotate: -2 },
  { shape: "circle", rotate: 3 },
  { shape: "round18", rotate: -3 },
  { shape: "arch", rotate: 1.5 },
  { shape: "circle", rotate: -4 },
  { shape: "round20", rotate: 2 },
  { shape: "arch", rotate: -1.5 },
];

export const slot = (i: number) => SLOT_PATTERN[i % SLOT_PATTERN.length];
