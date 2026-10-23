import { BooEyes } from "@/components/BooEyes";
import { BottomNav } from "@/components/BottomNav";
import { DashedCard } from "@/components/DashedCard";
import { c } from "@/lib/theme";

export default function WrapsPage() {
  return (
    <main className="screen" style={{ color: c.ink }}>
      <header style={{ padding: "34px 22px 0 22px" }}>
        <h1 style={{ margin: 0, fontWeight: 500, fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1.05 }}>Wraps</h1>
      </header>
      <DashedCard
        label="Coming soon"
        radius={24}
        style={{ margin: "22px 22px 0 22px", padding: "24px 18px 22px", alignItems: "center", textAlign: "center", gap: 10 }}
      >
        <BooEyes eyeW={18} eyeH={26} rim={2} pupilW={7} pupilH={10} gap={2} look="up" blink />
        <p style={{ margin: 0, fontSize: 19, fontWeight: 400, lineHeight: 1.3 }}>Coming soon</p>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 300, lineHeight: 1.4, color: c.muted }}>
          At the end of each month I&apos;ll put your roll together so you can share it on Instagram.
        </p>
      </DashedCard>
      <BottomNav />
    </main>
  );
}
