/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { radius, stickerShadow, type Shape } from "@/lib/theme";

type Props = {
  src: string;
  alt: string;
  size?: number;
  height?: number;
  shape: Shape;
  rotate?: number;
  scale?: number;
  border?: number;
  borderColor?: string;
  shadow?: string | false;
  radiusOverride?: string;
  style?: CSSProperties;
  className?: string;
};

// A photo as a die-cut sticker: white border, varied shape, small rotation.
export function Sticker({
  src,
  alt,
  size = 88,
  height,
  shape,
  rotate = 0,
  scale = 1,
  border = 6,
  borderColor = "#FFFFFF",
  shadow = stickerShadow,
  radiusOverride,
  style,
  className,
}: Props) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        width: size,
        height: height ?? size,
        objectFit: "cover",
        border: `${border}px solid ${borderColor}`,
        boxSizing: "border-box",
        borderRadius: radiusOverride ?? radius[shape],
        transform: rotate || scale !== 1 ? `rotate(${rotate}deg)${scale !== 1 ? ` scale(${scale})` : ""}` : undefined,
        boxShadow: shadow || undefined,
        display: "block",
        background: "#FFFFFF",
        ...style,
      }}
    />
  );
}
