import type { CSSProperties, ReactNode } from "react";
import { c } from "@/lib/theme";

// Dashed 1.5px outline used for "not yet" states and Boo's notes.
export function DashedCard({
  label,
  radius = 28,
  style,
  children,
}: {
  label: string;
  radius?: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={label}
      style={{
        position: "relative",
        border: `1.5px dashed ${c.soft}`,
        borderRadius: radius,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </section>
  );
}
