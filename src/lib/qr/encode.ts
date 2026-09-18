import { encode as uqrEncode } from "uqr";
import { contrastGate } from "./contrast";
import { serializePayload } from "./payloads";
import type { EncodeResult, Payload, QrOptions, ValidationResult } from "./types";

export function encodeOptionsError(options: QrOptions): string | null {
  const quiet = Math.round(options.quietZoneModules);
  if (!Number.isFinite(quiet) || quiet < 4) {
    return "Quiet zone must be at least 4 modules.";
  }
  if (options.logoDataUrl && options.ecc === "L") {
    return "Logos need error correction M, Q, or H. L cannot recover covered modules.";
  }
  const gate = contrastGate(options.fg, options.bg);
  if (gate.status === "block") return gate.message;
  return null;
}

export function canGenerate(payload: Payload, options: QrOptions): ValidationResult {
  const optionError = encodeOptionsError(options);
  if (optionError) return { ok: false, message: optionError };
  return serializePayload(payload);
}

export function encodeQr(canonical: string, options: QrOptions): EncodeResult {
  const quiet = Math.max(4, Math.round(options.quietZoneModules));
  const ecc = options.logoDataUrl && options.ecc === "L" ? "H" : options.ecc;
  const result = uqrEncode(canonical, {
    ecc,
    border: quiet,
    boostEcc: false,
  });
  return {
    data: result.data,
    size: result.size,
    version: result.version,
    canonical,
  };
}

export function maxLogoScale(ecc: QrOptions["ecc"]): number {
  if (ecc === "H") return 0.22;
  if (ecc === "Q") return 0.18;
  if (ecc === "M") return 0.12;
  return 0;
}

export function versionHint(version: number, ecc: QrOptions["ecc"], hasLogo: boolean): string | null {
  if (hasLogo && ecc === "L") return "Raise error correction to H before adding a logo.";
  if (version >= 10) {
    return `Version ${version} is dense. Shorten the payload or raise error correction for print.`;
  }
  if (hasLogo && ecc === "M") {
    return "Logo at ECC M is tight. H is safer for print runs.";
  }
  return null;
}
