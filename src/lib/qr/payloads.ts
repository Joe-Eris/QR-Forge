import type { Payload, PayloadType, ValidationResult, WifiSecurity } from "./types";

const FORBIDDEN_SCHEMES = new Set([
  "javascript:",
  "data:",
  "file:",
  "blob:",
  "about:",
  "vbscript:",
  "ftp:",
  "intent:",
  "marketplace:",
]);

export const TYPE_META: Record<
  PayloadType,
  { label: string; short: string; example: string }
> = {
  url: { label: "Website URL", short: "URL", example: "https://example.com" },
  text: { label: "Plain text", short: "Text", example: "Hello from QRForge" },
  wifi: { label: "Wi-Fi", short: "Wi-Fi", example: "Guest network" },
  vcard: { label: "vCard", short: "Contact", example: "Jane Doe" },
  email: { label: "Email", short: "Email", example: "hello@example.com" },
  sms: { label: "SMS", short: "SMS", example: "+15551234567" },
  tel: { label: "Phone", short: "Phone", example: "+15551234567" },
  geo: { label: "Location", short: "Geo", example: "37.78, -122.41" },
};

export function emptyPayload(type: PayloadType): Payload {
  switch (type) {
    case "url":
      return { type: "url", url: "" };
    case "text":
      return { type: "text", text: "" };
    case "wifi":
      return { type: "wifi", ssid: "", password: "", security: "WPA2", hidden: false };
    case "vcard":
      return { type: "vcard", fn: "", org: "", tel: "", email: "", url: "" };
    case "email":
      return { type: "email", address: "", subject: "", body: "" };
    case "sms":
      return { type: "sms", number: "", body: "" };
    case "tel":
      return { type: "tel", number: "" };
    case "geo":
      return { type: "geo", lat: "", lng: "" };
  }
}

export function isPayloadType(value: string): value is PayloadType {
  return value in TYPE_META;
}

function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1");
}

function wifiAuth(security: WifiSecurity): string {
  if (security === "NONE") return "nopass";
  if (security === "WEP") return "WEP";
  if (security === "WPA3") return "SAE";
  return "WPA";
}

function normalizeUrlInput(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    return new URL(withScheme);
  } catch {
    return null;
  }
}

export function serializePayload(payload: Payload): ValidationResult {
  switch (payload.type) {
    case "url": {
      const parsed = normalizeUrlInput(payload.url);
      if (!parsed) {
        return { ok: false, message: "Enter a valid website address.", field: "url" };
      }
      const scheme = `${parsed.protocol}`;
      if (FORBIDDEN_SCHEMES.has(scheme) || (scheme !== "http:" && scheme !== "https:")) {
        return {
          ok: false,
          message: `${scheme} URLs cannot be encoded. Use http or https.`,
          field: "url",
        };
      }
      if (parsed.href.length > 2048) {
        return { ok: false, message: "URL is over 2,048 characters after normalization.", field: "url" };
      }
      return { ok: true, canonical: parsed.href };
    }
    case "text": {
      const text = payload.text;
      if (!text.trim()) {
        return { ok: false, message: "Enter some text to encode.", field: "text" };
      }
      if (text.length > 1200) {
        return { ok: false, message: "Text is limited to 1,200 characters.", field: "text" };
      }
      return { ok: true, canonical: text };
    }
    case "wifi": {
      const ssid = payload.ssid;
      if (ssid.length < 1 || ssid.length > 32) {
        return { ok: false, message: "SSID must be 1–32 characters.", field: "ssid" };
      }
      if (payload.password.length > 63) {
        return { ok: false, message: "Password is limited to 63 characters.", field: "password" };
      }
      if (payload.security !== "NONE" && payload.password.length === 0) {
        return { ok: false, message: "Enter the network password, or set security to Open.", field: "password" };
      }
      const t = wifiAuth(payload.security);
      const hidden = payload.hidden ? "true" : "false";
      const passPart = t === "nopass" ? "" : `P:${escapeWifi(payload.password)};`;
      const canonical = `WIFI:T:${t};S:${escapeWifi(ssid)};${passPart}H:${hidden};;`;
      return { ok: true, canonical };
    }
    case "vcard": {
      const fn = payload.fn.trim();
      if (!fn) {
        return { ok: false, message: "Full name is required.", field: "fn" };
      }
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${fn}`];
      const parts = fn.split(/\s+/);
      const last = parts.length > 1 ? parts[parts.length - 1] : "";
      const first = parts.length > 1 ? parts.slice(0, -1).join(" ") : fn;
      lines.push(`N:${last};${first};;;`);
      if (payload.org.trim()) lines.push(`ORG:${payload.org.trim()}`);
      if (payload.tel.trim()) lines.push(`TEL:${payload.tel.trim()}`);
      if (payload.email.trim()) lines.push(`EMAIL:${payload.email.trim()}`);
      if (payload.url.trim()) lines.push(`URL:${payload.url.trim()}`);
      lines.push("END:VCARD");
      const canonical = lines.join("\n");
      if (new TextEncoder().encode(canonical).length > 1200) {
        return { ok: false, message: "vCard is too large to stay reliably scannable (1,200 byte cap).", field: "fn" };
      }
      return { ok: true, canonical };
    }
    case "email": {
      const address = payload.address.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
        return { ok: false, message: "Enter a valid email address.", field: "address" };
      }
      const params = new URLSearchParams();
      if (payload.subject.trim()) params.set("subject", payload.subject.trim());
      if (payload.body.trim()) params.set("body", payload.body.trim());
      const qs = params.toString();
      return { ok: true, canonical: qs ? `mailto:${address}?${qs}` : `mailto:${address}` };
    }
    case "sms": {
      const number = payload.number.trim();
      if (!number) {
        return { ok: false, message: "Enter a phone number.", field: "number" };
      }
      const body = payload.body.trim();
      return {
        ok: true,
        canonical: body
          ? `sms:${number}?body=${encodeURIComponent(body)}`
          : `sms:${number}`,
      };
    }
    case "tel": {
      const number = payload.number.trim();
      if (!number) {
        return { ok: false, message: "Enter a phone number.", field: "number" };
      }
      const compact = number.replace(/[^\d+]/g, "");
      if (compact.replace("+", "").length < 3) {
        return { ok: false, message: "That phone number looks too short.", field: "number" };
      }
      return { ok: true, canonical: `tel:${compact}` };
    }
    case "geo": {
      const lat = Number(payload.lat);
      const lng = Number(payload.lng);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return { ok: false, message: "Latitude must be between −90 and 90.", field: "lat" };
      }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        return { ok: false, message: "Longitude must be between −180 and 180.", field: "lng" };
      }
      return { ok: true, canonical: `geo:${lat},${lng}` };
    }
  }
}

export function defaultName(payload: Payload): string {
  switch (payload.type) {
    case "url":
      try {
        return new URL(serializePayload(payload).ok ? (serializePayload(payload) as { canonical: string }).canonical : payload.url).hostname;
      } catch {
        return payload.url.trim() || "Website";
      }
    case "text":
      return payload.text.trim().slice(0, 32) || "Text";
    case "wifi":
      return payload.ssid.trim() || "Wi-Fi";
    case "vcard":
      return payload.fn.trim() || "Contact";
    case "email":
      return payload.address.trim() || "Email";
    case "sms":
      return payload.number.trim() || "SMS";
    case "tel":
      return payload.number.trim() || "Phone";
    case "geo":
      return payload.lat && payload.lng ? `${payload.lat}, ${payload.lng}` : "Location";
  }
}

export function detectPayloadType(raw: string): PayloadType {
  const t = raw.trim();
  if (/^WIFI:/i.test(t)) return "wifi";
  if (/^BEGIN:VCARD/i.test(t)) return "vcard";
  if (/^mailto:/i.test(t)) return "email";
  if (/^sms:/i.test(t)) return "sms";
  if (/^tel:/i.test(t)) return "tel";
  if (/^geo:/i.test(t)) return "geo";
  if (/^https?:\/\//i.test(t)) return "url";
  return "text";
}
