import type { PayloadType } from "./types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function downloadFilename(type: PayloadType, ext: string, at = new Date()): string {
  const y = at.getFullYear();
  const m = pad(at.getMonth() + 1);
  const d = pad(at.getDate());
  const hh = pad(at.getHours());
  const mm = pad(at.getMinutes());
  const ss = pad(at.getSeconds());
  return `qrforge-${type}-${y}${m}${d}-${hh}${mm}${ss}.${ext}`;
}

export function printSizeMm(pixelEdge: number, dpi = 300): number {
  return (pixelEdge / dpi) * 25.4;
}
