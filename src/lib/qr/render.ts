import { maxLogoScale } from "./encode";
import type { EncodeResult, QrOptions } from "./types";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function matrixPath(data: boolean[][]): string {
  let d = "";
  for (let y = 0; y < data.length; y += 1) {
    const row = data[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x += 1) {
      if (row[x]) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return d;
}

function logoBox(size: number, quiet: number, scale: number, ecc: QrOptions["ecc"]) {
  const inner = size - quiet * 2;
  const clamped = Math.min(scale, maxLogoScale(ecc));
  const logoModules = Math.max(1, inner * clamped);
  const x = (size - logoModules) / 2;
  const pad = Math.max(1, logoModules * 0.12);
  return { x: x - pad / 2, y: x - pad / 2, w: logoModules + pad, logo: logoModules };
}

export function renderSvgString(
  encoded: EncodeResult,
  options: QrOptions,
  logoHref?: string | null,
): string {
  const { data, size } = encoded;
  const modulePx = options.modulePx;
  const caption = options.caption.trim().slice(0, 48);
  const captionH = caption ? Math.ceil(size * 0.18) : 0;
  const vbW = size;
  const vbH = size + captionH;
  const path = matrixPath(data);
  const logo = options.logoDataUrl && logoHref !== null ? logoBox(size, options.quietZoneModules, options.logoScale, options.ecc) : null;
  const href = logoHref ?? options.logoDataUrl;

  let logoMarkup = "";
  if (logo && href) {
    logoMarkup = `<rect x="${logo.x.toFixed(3)}" y="${logo.y.toFixed(3)}" width="${logo.w.toFixed(3)}" height="${logo.w.toFixed(3)}" rx="${(logo.w * 0.08).toFixed(3)}" fill="${escapeXml(options.bg)}"/>
    <image href="${escapeXml(href)}" x="${((logo.x + logo.w - logo.logo) / 1 + (logo.w - logo.logo) / 2 + logo.x).toFixed(3)}" y="${(logo.y + (logo.w - logo.logo) / 2).toFixed(3)}" width="${logo.logo.toFixed(3)}" height="${logo.logo.toFixed(3)}" preserveAspectRatio="xMidYMid meet"/>`;
    const lx = logo.x + (logo.w - logo.logo) / 2;
    const ly = logo.y + (logo.w - logo.logo) / 2;
    logoMarkup = `<rect x="${logo.x.toFixed(3)}" y="${logo.y.toFixed(3)}" width="${logo.w.toFixed(3)}" height="${logo.w.toFixed(3)}" rx="${(logo.w * 0.08).toFixed(3)}" fill="${escapeXml(options.bg)}"/>
    <image href="${escapeXml(href)}" x="${lx.toFixed(3)}" y="${ly.toFixed(3)}" width="${logo.logo.toFixed(3)}" height="${logo.logo.toFixed(3)}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  const captionMarkup = caption
    ? `<text x="${vbW / 2}" y="${size + captionH * 0.62}" text-anchor="middle" font-family="IBM Plex Sans, ui-sans-serif, system-ui, sans-serif" font-size="${Math.max(1.6, captionH * 0.38)}" fill="${escapeXml(options.fg)}">${escapeXml(caption)}</text>`
    : "";

  const pixelW = size * modulePx;
  const pixelH = vbH * modulePx;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${vbW} ${vbH}" width="${pixelW}" height="${pixelH}" shape-rendering="crispEdges" role="img" aria-label="${escapeXml(caption || "QR code")}">
  <title>${escapeXml(caption || "QR code")}</title>
  <rect width="100%" height="100%" fill="${escapeXml(options.bg)}"/>
  <path fill="${escapeXml(options.fg)}" d="${path}"/>
  ${logoMarkup}
  ${captionMarkup}
</svg>`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load logo"));
    img.src = src;
  });
}

export async function rasterizeLogo(file: File): Promise<string> {
  if (file.size > 1_000_000) {
    throw new Error("Logo must be 1 MB or smaller.");
  }
  const type = file.type;
  if (!["image/png", "image/jpeg", "image/svg+xml", "image/webp"].includes(type)) {
    throw new Error("Use PNG, SVG, JPEG, or WebP for the logo.");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    const max = 512;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function renderRasterBlob(
  encoded: EncodeResult,
  options: QrOptions,
  format: "png" | "jpeg",
): Promise<Blob> {
  const { data, size } = encoded;
  const modulePx = options.modulePx;
  const caption = options.caption.trim().slice(0, 48);
  const captionPx = caption ? Math.round(modulePx * 6) : 0;
  const width = size * modulePx;
  const height = width + captionPx;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = format === "jpeg" ? "#FFFFFF" : options.bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = options.fg;
  for (let y = 0; y < data.length; y += 1) {
    const row = data[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x += 1) {
      if (row[x]) ctx.fillRect(x * modulePx, y * modulePx, modulePx, modulePx);
    }
  }

  if (options.logoDataUrl && options.ecc !== "L") {
    try {
      const img = await loadImage(options.logoDataUrl);
      const box = logoBox(size, options.quietZoneModules, options.logoScale, options.ecc);
      ctx.fillStyle = options.bg;
      const padX = box.x * modulePx;
      const padY = box.y * modulePx;
      const padW = box.w * modulePx;
      const r = padW * 0.08;
      ctx.beginPath();
      ctx.roundRect(padX, padY, padW, padW, r);
      ctx.fill();
      const logoPx = box.logo * modulePx;
      const lx = padX + (padW - logoPx) / 2;
      const ly = padY + (padW - logoPx) / 2;
      ctx.drawImage(img, lx, ly, logoPx, logoPx);
    } catch {
      /* logo optional — still emit a scannable code */
    }
  }

  if (caption) {
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = format === "jpeg" ? "#0F172A" : options.fg;
    ctx.font = `500 ${Math.max(12, Math.round(captionPx * 0.38))}px "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(caption, width / 2, width + captionPx / 2, width * 0.92);
  }

  const mime = format === "png" ? "image/png" : "image/jpeg";
  const quality = format === "jpeg" ? 0.92 : undefined;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob) throw new Error("Could not export image");
  return blob;
}

export function svgToBlob(svg: string): Blob {
  return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
}

export function svgForHtml(svg: string): string {
  return svg.replace(/<\?xml[\s\S]*?\?>\s*/i, "");
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
