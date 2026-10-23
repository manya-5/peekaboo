import { c } from "@/lib/theme";

type P = { color?: string; size?: number };

export const CameraIcon = ({ color = c.white, size = 18, stroke = 1.8 }: P & { stroke?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const StairsIcon = ({ color = c.action }: P) => (
  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h4v-4h4v-4h4V8h4" />
  </svg>
);

export const CloseIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.ink} strokeWidth="1.7" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const FlashIcon = ({ on }: { on: boolean }) => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill={on ? c.yellow : "none"} stroke={c.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3L5 14h6l-1 7 8-11h-6z" />
  </svg>
);

export const PlusIcon = () => (
  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.action} strokeWidth="1.6" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const TodayIcon = ({ active }: { active: boolean }) => {
  const s = active ? c.action : c.muted2;
  const p = active ? c.pupil : c.muted2;
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
      <ellipse cx="8.5" cy="12" rx="3.6" ry="5.2" fill="#FFFFFF" stroke={s} strokeWidth="1.5" />
      <ellipse cx="15.5" cy="12" rx="3.6" ry="5.2" fill="#FFFFFF" stroke={s} strokeWidth="1.5" />
      <ellipse cx="8.5" cy="14" rx="1.5" ry="2.1" fill={p} />
      <ellipse cx="15.5" cy="14" rx="1.5" ry="2.1" fill={p} />
    </svg>
  );
};

const Line = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const RollIcon = ({ color }: { color: string }) => (
  <Line color={color}>
    <circle cx="7" cy="7" r="3.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <path d="M3.5 20.5v-3a3.5 3.5 0 0 1 7 0v3z" />
    <circle cx="17" cy="17" r="3.5" />
  </Line>
);

export const TrophyIcon = ({ color }: { color: string }) => (
  <Line color={color}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
    <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4" />
  </Line>
);

export const HeartIcon = ({ color }: { color: string }) => (
  <Line color={color}>
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
  </Line>
);
