export const PAYLOAD_TYPES = [
  "url",
  "text",
  "wifi",
  "vcard",
  "email",
  "sms",
  "tel",
  "geo",
] as const;

export type PayloadType = (typeof PAYLOAD_TYPES)[number];

export type EccLevel = "L" | "M" | "Q" | "H";

export type WifiSecurity = "NONE" | "WPA" | "WPA2" | "WPA3" | "WEP";

export type Payload =
  | { type: "url"; url: string }
  | { type: "text"; text: string }
  | {
      type: "wifi";
      ssid: string;
      password: string;
      security: WifiSecurity;
      hidden: boolean;
    }
  | {
      type: "vcard";
      fn: string;
      org: string;
      tel: string;
      email: string;
      url: string;
    }
  | { type: "email"; address: string; subject: string; body: string }
  | { type: "sms"; number: string; body: string }
  | { type: "tel"; number: string }
  | { type: "geo"; lat: string; lng: string };

export type QrOptions = {
  fg: string;
  bg: string;
  ecc: EccLevel;
  quietZoneModules: number;
  modulePx: number;
  caption: string;
  logoDataUrl: string | null;
  logoScale: number;
};

export const DEFAULT_OPTIONS: QrOptions = {
  fg: "#0F172A",
  bg: "#FFFFFF",
  ecc: "M",
  quietZoneModules: 4,
  modulePx: 8,
  caption: "",
  logoDataUrl: null,
  logoScale: 0.18,
};

export const MODULE_SCALES = [8, 16, 32] as const;

export type ValidationResult =
  | { ok: true; canonical: string }
  | { ok: false; message: string; field?: string };

export type ContrastGate = {
  ratio: number;
  status: "ok" | "warn" | "block";
  message: string | null;
};

export type EncodeResult = {
  data: boolean[][];
  size: number;
  version: number;
  canonical: string;
};
