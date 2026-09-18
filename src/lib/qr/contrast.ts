import type { ContrastGate } from "./types";

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function srgbToLin(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  return (
    0.2126 * srgbToLin(rgb.r) +
    0.7152 * srgbToLin(rgb.g) +
    0.0722 * srgbToLin(rgb.b)
  );
}

export function contrastRatio(fg: string, bg: string): number | null {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  if (a == null || b == null) return null;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

/** FR-4.1 warn < 4.5:1, FR-4.2 block < 3:1 */
export function contrastGate(fg: string, bg: string): ContrastGate {
  const ratio = contrastRatio(fg, bg);
  if (ratio == null) {
    return {
      ratio: 0,
      status: "block",
      message: "Enter valid hex colors for modules and background.",
    };
  }
  if (ratio < 3) {
    return {
      ratio,
      status: "block",
      message: `Contrast ${ratio.toFixed(2)}:1 is too low. Scanners need at least 3:1 (aim for 7:1).`,
    };
  }
  if (ratio < 4.5) {
    return {
      ratio,
      status: "warn",
      message: `Contrast ${ratio.toFixed(2)}:1 is weak. 4.5:1 is safer; 7:1 is recommended for print.`,
    };
  }
  return { ratio, status: "ok", message: null };
}

export function isValidHex(hex: string): boolean {
  return parseHex(hex) != null;
}
