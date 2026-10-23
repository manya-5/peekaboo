"use client";

import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { c } from "@/lib/theme";

type B = ButtonHTMLAttributes<HTMLButtonElement>;

const base: CSSProperties = {
  fontFamily: "inherit",
  cursor: "pointer",
};

export function PrimaryButton({ style, ...rest }: B) {
  return (
    <button
      type="button"
      {...rest}
      style={{
        ...base,
        height: 48,
        border: 0,
        borderRadius: 999,
        background: c.action,
        color: c.white,
        fontSize: 16,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: rest.disabled ? 0.6 : 1,
        ...style,
      }}
    />
  );
}

export function OutlineButton({ style, ...rest }: B) {
  return (
    <button
      type="button"
      {...rest}
      style={{
        ...base,
        height: 48,
        border: `1.5px solid ${c.action}`,
        borderRadius: 999,
        background: "transparent",
        color: c.action,
        fontSize: 16,
        fontWeight: 500,
        opacity: rest.disabled ? 0.6 : 1,
        ...style,
      }}
    />
  );
}

export function TextButton({ style, ...rest }: B) {
  return (
    <button
      type="button"
      {...rest}
      style={{
        ...base,
        border: 0,
        background: "transparent",
        padding: "12px 8px",
        fontSize: 14,
        color: c.action,
        opacity: rest.disabled ? 0.6 : 1,
        ...style,
      }}
    />
  );
}

export function SmallOutlineButton({ style, ...rest }: B) {
  return (
    <button
      type="button"
      {...rest}
      style={{
        ...base,
        height: 36,
        padding: "0 14px",
        border: `1.5px solid ${c.action}`,
        borderRadius: 999,
        background: "transparent",
        color: c.action,
        fontSize: 14,
        fontWeight: 500,
        opacity: rest.disabled ? 0.6 : 1,
        ...style,
      }}
    />
  );
}
