// Date helpers that work in the profile's timezone, not the server's.

export function partsIn(tz: string, d = new Date()) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    weekday: p.weekday as string,
  };
}

export function todayIn(tz: string, d = new Date()) {
  const p = partsIn(tz, d);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string) {
  return Math.round(
    (new Date(`${toIso}T12:00:00Z`).getTime() - new Date(`${fromIso}T12:00:00Z`).getTime()) / 86400000,
  );
}

export function isWeekend(iso: string) {
  const day = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_MONTHS = MONTHS.map((m) => m.slice(0, 3));
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function monthName(iso: string) {
  return MONTHS[Number(iso.slice(5, 7)) - 1];
}

export function monthStart(iso: string) {
  return `${iso.slice(0, 7)}-01`;
}

// "Thu · Oct 22"
export function headerDate(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]} · ${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

// "Oct 6"
export function shortDate(iso: string) {
  return `${SHORT_MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}`;
}

// "October 20"
export function longDate(iso: string) {
  return `${monthName(iso)} ${Number(iso.slice(8, 10))}`;
}

// "Oct 6, 13, 19" (assumes same month, which is the common case)
export function dateList(isos: string[]) {
  if (!isos.length) return "";
  const sorted = [...isos].sort();
  const sameMonth = sorted.every((d) => d.slice(0, 7) === sorted[0].slice(0, 7));
  if (!sameMonth) return sorted.map(shortDate).join(", ");
  return `${SHORT_MONTHS[Number(sorted[0].slice(5, 7)) - 1]} ${sorted.map((d) => Number(d.slice(8, 10))).join(", ")}`;
}

// "4:48 pm"
export function clock(tz: string, iso: string) {
  const p = partsIn(tz, new Date(iso));
  const h = p.hour % 12 || 12;
  return `${h}:${String(p.minute).padStart(2, "0")} ${p.hour < 12 ? "am" : "pm"}`;
}

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function fromMinutes(min: number) {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

// "4" or "4:30" (12-hour, no am/pm, like the design's "Best light, 4 to 6")
export function hourLabel(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const hh = h % 12 || 12;
  return m ? `${hh}:${String(m).padStart(2, "0")}` : `${hh}`;
}

// "3:12"
export function nowLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  return `${h % 12 || 12}:${String(minutes % 60).padStart(2, "0")}`;
}

const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen"];

// "9 days left", "3 weeks left"
export function timeLeft(todayIso: string, deadline: string, words = false) {
  const days = daysBetween(todayIso, deadline);
  const n = (x: number) => (words && x < NUMBER_WORDS.length ? NUMBER_WORDS[x] : String(x));
  if (days <= 0) return "Last day";
  if (days === 1) return words ? "One day left" : "1 day left";
  if (days < 14) return `${n(days)} days left`;
  return `${n(Math.floor(days / 7))} weeks left`;
}
