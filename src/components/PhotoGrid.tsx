import Link from "next/link";
import { c, slot } from "@/lib/theme";
import { longDate, todayIn } from "@/lib/time";
import type { Photo } from "@/lib/types";
import { Sticker } from "./Sticker";

export type GridItem = { kind: "today"; href: string } | { kind: "photo"; photo: Photo; justNow?: boolean };

export function photoAlt(p: Photo, tz: string) {
  const what = p.what ? p.what.replace(/\.$/, "") : "a photo";
  return `${longDate(todayIn(tz, new Date(p.takenAt)))}, ${what.charAt(0).toLowerCase()}${what.slice(1)}`;
}

// The month as stickers, newest first. Shape and tilt follow the photo's place
// in the month (newest is 0), the way the designs lay them out.
export function PhotoGrid({
  items,
  tz,
  rowGap = 16,
  label,
  from,
}: {
  items: GridItem[];
  tz: string;
  rowGap?: number;
  label: string;
  from: "home" | "roll";
}) {
  let photoIndex = 0;
  return (
    <div
      aria-label={label}
      role="list"
      style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", rowGap, columnGap: 16, justifyItems: "center" }}
    >
      {items.map((it) => {
        if (it.kind === "today") {
          return (
            <Link
              role="listitem"
              key="today"
              href={it.href}
              aria-label="Today, not taken yet"
              style={{
                width: 88,
                height: 88,
                border: `1.5px dashed ${c.soft}`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 500,
                color: c.action,
                textDecoration: "none",
              }}
            >
              Today
            </Link>
          );
        }
        const s = slot(photoIndex++);
        if (it.justNow) {
          return (
            <Link role="listitem" key={it.photo.id} href={`/photo/${it.photo.id}?from=${from}`} style={{ position: "relative", display: "block" }} className="land">
              <Sticker
                src={it.photo.url}
                alt={`Today, ${photoAlt(it.photo, tz)}`}
                size={96}
                shape="arch"
                rotate={-5}
                scale={1.06}
                shadow="0 8px 18px rgba(70, 60, 40, 0.2)"
              />
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: -20,
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  fontSize: 13,
                  fontWeight: 500,
                  color: c.action,
                }}
              >
                Just now
              </span>
            </Link>
          );
        }
        return (
          <Link role="listitem" key={it.photo.id} href={`/photo/${it.photo.id}?from=${from}`} style={{ display: "block" }}>
            <Sticker src={it.photo.url} alt={photoAlt(it.photo, tz)} shape={s.shape} rotate={s.rotate} />
          </Link>
        );
      })}
    </div>
  );
}
