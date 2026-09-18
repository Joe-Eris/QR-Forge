import type { ReactNode } from "react";
import type { Payload, PayloadType, WifiSecurity } from "@/lib/qr/types";
import { TYPE_META } from "@/lib/qr/payloads";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function PayloadForm({
  payload,
  onChange,
  errorField,
}: {
  payload: Payload;
  onChange: (next: Payload) => void;
  errorField?: string;
}) {
  const set = (patch: Partial<Payload> & { type: PayloadType }) => onChange({ ...payload, ...patch } as Payload);

  switch (payload.type) {
    case "url":
      return (
        <Field id="url" label="Website" hint="http and https only. javascript: and data: are blocked.">
          <Input
            id="url"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder={TYPE_META.url.example}
            value={payload.url}
            aria-invalid={errorField === "url"}
            onChange={(e) => set({ type: "url", url: e.target.value })}
          />
        </Field>
      );
    case "text":
      return (
        <Field id="text" label="Text" hint={`${payload.text.length}/1,200`}>
          <Textarea
            id="text"
            placeholder={TYPE_META.text.example}
            value={payload.text}
            maxLength={1200}
            aria-invalid={errorField === "text"}
            onChange={(e) => set({ type: "text", text: e.target.value })}
          />
        </Field>
      );
    case "wifi":
      return (
        <div className="grid gap-4">
          <Field id="ssid" label="Network name (SSID)">
            <Input
              id="ssid"
              value={payload.ssid}
              maxLength={32}
              placeholder="Cafe-Guest"
              aria-invalid={errorField === "ssid"}
              onChange={(e) => set({ type: "wifi", ssid: e.target.value })}
            />
          </Field>
          <Field id="security" label="Security">
            <Select
              value={payload.security}
              onValueChange={(v) => set({ type: "wifi", security: v as WifiSecurity })}
            >
              <SelectTrigger id="security" aria-label="Wi-Fi security">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA2">WPA2</SelectItem>
                <SelectItem value="WPA3">WPA3</SelectItem>
                <SelectItem value="WPA">WPA</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="NONE">Open (no password)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {payload.security !== "NONE" ? (
            <Field id="password" label="Password" hint="Never shown in the page title or social preview.">
              <Input
                id="password"
                type="password"
                autoComplete="off"
                value={payload.password}
                maxLength={63}
                aria-invalid={errorField === "password"}
                onChange={(e) => set({ type: "wifi", password: e.target.value })}
              />
            </Field>
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={payload.hidden}
              onChange={(e) => set({ type: "wifi", hidden: e.target.checked })}
            />
            Hidden network
          </label>
        </div>
      );
    case "vcard":
      return (
        <div className="grid gap-4">
          <Field id="fn" label="Full name">
            <Input
              id="fn"
              value={payload.fn}
              aria-invalid={errorField === "fn"}
              onChange={(e) => set({ type: "vcard", fn: e.target.value })}
            />
          </Field>
          <Field id="org" label="Organization">
            <Input id="org" value={payload.org} onChange={(e) => set({ type: "vcard", org: e.target.value })} />
          </Field>
          <Field id="vtel" label="Phone">
            <Input id="vtel" value={payload.tel} onChange={(e) => set({ type: "vcard", tel: e.target.value })} />
          </Field>
          <Field id="vemail" label="Email">
            <Input id="vemail" type="email" value={payload.email} onChange={(e) => set({ type: "vcard", email: e.target.value })} />
          </Field>
          <Field id="vurl" label="Website">
            <Input id="vurl" value={payload.url} onChange={(e) => set({ type: "vcard", url: e.target.value })} />
          </Field>
        </div>
      );
    case "email":
      return (
        <div className="grid gap-4">
          <Field id="address" label="Address">
            <Input
              id="address"
              type="email"
              value={payload.address}
              aria-invalid={errorField === "address"}
              onChange={(e) => set({ type: "email", address: e.target.value })}
            />
          </Field>
          <Field id="subject" label="Subject">
            <Input id="subject" value={payload.subject} onChange={(e) => set({ type: "email", subject: e.target.value })} />
          </Field>
          <Field id="body" label="Body">
            <Textarea id="body" value={payload.body} onChange={(e) => set({ type: "email", body: e.target.value })} />
          </Field>
        </div>
      );
    case "sms":
      return (
        <div className="grid gap-4">
          <Field id="sms-number" label="Number">
            <Input
              id="sms-number"
              value={payload.number}
              aria-invalid={errorField === "number"}
              onChange={(e) => set({ type: "sms", number: e.target.value })}
            />
          </Field>
          <Field id="sms-body" label="Message">
            <Textarea id="sms-body" value={payload.body} onChange={(e) => set({ type: "sms", body: e.target.value })} />
          </Field>
        </div>
      );
    case "tel":
      return (
        <Field id="tel" label="Phone number" hint="E.164 suggested, not required.">
          <Input
            id="tel"
            type="tel"
            placeholder="+15551234567"
            value={payload.number}
            aria-invalid={errorField === "number"}
            onChange={(e) => set({ type: "tel", number: e.target.value })}
          />
        </Field>
      );
    case "geo":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field id="lat" label="Latitude">
            <Input
              id="lat"
              inputMode="decimal"
              value={payload.lat}
              aria-invalid={errorField === "lat"}
              onChange={(e) => set({ type: "geo", lat: e.target.value })}
            />
          </Field>
          <Field id="lng" label="Longitude">
            <Input
              id="lng"
              inputMode="decimal"
              value={payload.lng}
              aria-invalid={errorField === "lng"}
              onChange={(e) => set({ type: "geo", lng: e.target.value })}
            />
          </Field>
        </div>
      );
  }
}
