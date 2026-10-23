import { c } from "@/lib/theme";
import { BooEyes } from "./BooEyes";

export function Wordmark() {
  return (
    <h1
      aria-label="Peekaboo"
      style={{
        margin: 0,
        display: "flex",
        alignItems: "flex-end",
        fontWeight: 600,
        fontSize: 42,
        lineHeight: 1,
        letterSpacing: "-0.035em",
        color: c.soft,
      }}
    >
      <span aria-hidden="true">Peekab</span>
      <BooEyes eyeW={21} eyeH={25} rim={3} pupilW={8} pupilH={11} gap={1} blink style={{ margin: "0 0 8px 1px" }} />
    </h1>
  );
}
