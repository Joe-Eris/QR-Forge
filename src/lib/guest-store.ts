import { useEffect, useState } from "react";
import type { Payload, PayloadType, QrOptions } from "@/lib/qr/types";

export const GUEST_KEY = "qrforge.guest.v1";
const CAP = 20;
const VERSION = 1;

export type StoredCode = {
  id: string;
  name: string;
  payloadType: PayloadType;
  payload: Payload;
  options: QrOptions;
  thumbnailSvg: string | null;
  createdAt: string;
  updatedAt: string;
};

type Store = { version: number; items: StoredCode[] };

function empty(): Store {
  return { version: VERSION, items: [] };
}

function read(): Store {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Store;
    if (parsed.version !== VERSION || !Array.isArray(parsed.items)) return empty();
    return { version: VERSION, items: parsed.items.slice(0, CAP) };
  } catch {
    return empty();
  }
}

function write(store: Store) {
  window.localStorage.setItem(GUEST_KEY, JSON.stringify({ version: VERSION, items: store.items.slice(0, CAP) }));
  window.dispatchEvent(new Event("qrforge-guest"));
}

export function listGuestCodes(): StoredCode[] {
  return read().items;
}

export function getGuestCode(id: string): StoredCode | undefined {
  return read().items.find((item) => item.id === id);
}

export function upsertGuestCode(code: StoredCode): StoredCode[] {
  const store = read();
  const next = [code, ...store.items.filter((item) => item.id !== code.id)].slice(0, CAP);
  write({ version: VERSION, items: next });
  return next;
}

export function deleteGuestCode(id: string): StoredCode[] {
  const store = read();
  const next = store.items.filter((item) => item.id !== id);
  write({ version: VERSION, items: next });
  return next;
}

export function clearGuestCodes() {
  write(empty());
}

export function guestHasSensitive(items = listGuestCodes()): boolean {
  return items.some((item) => item.payloadType === "wifi" || item.payloadType === "vcard");
}

export function useGuestCodes() {
  const [items, setItems] = useState<StoredCode[]>([]);
  useEffect(() => {
    const refresh = () => setItems(listGuestCodes());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("qrforge-guest", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("qrforge-guest", refresh);
    };
  }, []);
  return items;
}
