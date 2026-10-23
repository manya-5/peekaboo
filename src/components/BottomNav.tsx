"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { c } from "@/lib/theme";
import { CameraIcon, HeartIcon, RollIcon, TodayIcon, TrophyIcon } from "./Icons";

const tab = (active: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
  fontSize: 12,
  fontWeight: active ? 500 : 400,
  color: active ? c.action : c.muted2,
  textDecoration: "none",
  height: "100%",
});

function Tab({ href, active, icon, label }: { href: string; active: boolean; icon: ReactNode; label: string }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} style={tab(active)}>
      {icon}
      {label}
    </Link>
  );
}

export function BottomNav() {
  const path = usePathname();
  const is = (p: string) => (p === "/" ? path === "/" : path.startsWith(p));
  const color = (p: string) => (is(p) ? c.action : c.muted2);

  return (
    <nav
      aria-label="Main"
      style={{
        position: "sticky",
        bottom: 0,
        marginTop: "auto",
        background: c.cream,
        borderTop: `1px solid ${c.track}`,
        paddingBottom: "max(6px, env(safe-area-inset-bottom))",
        zIndex: 10,
      }}
    >
      <div style={{ height: 64, display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", alignItems: "center" }}>
        <Tab href="/" active={is("/")} icon={<TodayIcon active={is("/")} />} label="Today" />
        <Tab href="/roll" active={is("/roll")} icon={<RollIcon color={color("/roll")} />} label="Roll" />
        <Link
          href="/shoot"
          aria-label="Take any photo"
          style={{
            justifySelf: "center",
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: c.action,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CameraIcon size={24} />
        </Link>
        <Tab href="/contests" active={is("/contests")} icon={<TrophyIcon color={color("/contests")} />} label="Contests" />
        <Tab href="/wraps" active={is("/wraps")} icon={<HeartIcon color={color("/wraps")} />} label="Wraps" />
      </div>
    </nav>
  );
}
