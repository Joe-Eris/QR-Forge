import { Link } from "@tanstack/react-router";
import {
  Link2,
  Type,
  Wifi,
  Contact,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Download,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import { encodeQr } from "@/lib/qr/encode";
import { renderSvgString, svgForHtml } from "@/lib/qr/render";
import { DEFAULT_OPTIONS, type PayloadType } from "@/lib/qr/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sampleSvg = svgForHtml(
  renderSvgString(encodeQr("https://example.com/", { ...DEFAULT_OPTIONS, modulePx: 8 }), {
    ...DEFAULT_OPTIONS,
    caption: "",
  }),
);

const PAYLOADS: Array<{ type: PayloadType; label: string; blurb: string; icon: typeof Link2 }> = [
  { type: "url", label: "Website", blurb: "http(s) only — no javascript: tricks.", icon: Link2 },
  { type: "text", label: "Text", blurb: "Notes, codes, or a short message.", icon: Type },
  { type: "wifi", label: "Wi-Fi", blurb: "SSID, security, password. Escaped correctly.", icon: Wifi },
  { type: "vcard", label: "Contact", blurb: "vCard 3.0 with name, phone, email.", icon: Contact },
  { type: "email", label: "Email", blurb: "mailto with optional subject and body.", icon: Mail },
  { type: "sms", label: "SMS", blurb: "Number plus a draft message.", icon: MessageSquare },
  { type: "tel", label: "Phone", blurb: "One tap to call.", icon: Phone },
  { type: "geo", label: "Location", blurb: "Latitude and longitude.", icon: MapPin },
];

const FAQS = [
  {
    q: "Static vs dynamic — what’s the difference?",
    a: "A static code locks the content inside the image. Once printed, the destination cannot change. Dynamic codes (coming in Pro) encode a QRForge redirect so you can edit the URL after print.",
  },
  {
    q: "Do you store my URL?",
    a: "Guest generation never leaves this browser. Saved library items are stored so you can reprint them. We never log payload contents.",
  },
  {
    q: "Can I put a logo in the middle?",
    a: "Yes. PNG, SVG, or JPEG, auto-scaled, refused at error-correction L, and padded so finder patterns stay clear.",
  },
  {
    q: "Can I use this commercially?",
    a: "Yes. Static downloads on the free plan have no watermark. Keep the quiet zone and test-scan before a bulk print run.",
  },
];

export function LandingPage() {
  return (
    <div className="flex flex-col gap-20 pb-8">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)]">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">URL · Wi-Fi · vCard · scan</p>
          <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Create scannable QR codes in the browser.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            No account required for static downloads. Preview is the file — sharp modules, a real quiet zone, and no watermark.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/create" search={{ type: "url" }}>
                Create a QR code
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/scan">Scan a code</Link>
            </Button>
          </div>
          <ul className="mt-8 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Guest-first, on-device encode
            </li>
            <li className="flex items-center gap-2">
              <Download className="size-4 text-primary" /> PNG, SVG, JPEG
            </li>
            <li className="flex items-center gap-2">
              <ScanLine className="size-4 text-primary" /> Decode from photo or camera
            </li>
            <li className="flex items-center gap-2">
              <Wifi className="size-4 text-primary" /> Wi-Fi, vCard, URL, and more
            </li>
          </ul>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div
              className="rounded-lg border border-border bg-card p-4"
              dangerouslySetInnerHTML={{ __html: sampleSvg }}
              aria-label="Sample QR code for https://example.com/"
            />
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">example.com</p>
                <p className="text-xs text-muted-foreground">Static · ECC M · quiet zone 4</p>
              </div>
              <Badge variant="secondary">No watermark</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Proof">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Static now", body: "Dynamic codes ship with Pro." },
            { title: "PNG + SVG", body: "Same encoder as the live preview." },
            { title: "Wi-Fi & vCard", body: "Canonical payloads phones understand." },
            { title: "No watermark", body: "Free static downloads stay clean." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-5">
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl font-medium tracking-tight">How it works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { n: "01", t: "Type the payload", d: "URL, Wi-Fi, contact, or text. Invalid schemes are blocked before a matrix exists." },
            { n: "02", t: "Style for scan", d: "Colors, error correction, quiet zone, optional logo. Contrast under 3:1 cannot download." },
            { n: "03", t: "Download or save", d: "PNG, SVG, or JPEG named for the job. Sign in only if you want a library." },
          ].map((step) => (
            <li key={step.n} className="rounded-xl border border-border bg-card p-6">
              <p className="font-mono text-xs tracking-widest text-primary">{step.n}</p>
              <p className="mt-3 font-display text-xl font-medium">{step.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-medium tracking-tight">Payload types</h2>
          <Link to="/create" search={{ type: "url" }} className="text-sm font-medium text-primary hover:underline">
            Open workspace
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PAYLOADS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.type}
                to="/create"
                search={{ type: p.type }}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <Icon className="size-5 text-primary" />
                <p className="mt-3 font-medium group-hover:text-primary">{p.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-8">
          <Badge>Free</Badge>
          <h2 className="mt-4 font-display text-3xl font-medium">Available now</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>30 saved static codes / month</li>
            <li>All payload types, logo, SVG</li>
            <li>Guest downloads unlimited on-device</li>
            <li>No watermark on static files</li>
          </ul>
          <Button asChild className="mt-6">
            <Link to="/create" search={{ type: "url" }}>
              Start creating
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8">
          <Badge variant="secondary">Pro · coming</Badge>
          <h2 className="mt-4 font-display text-3xl font-medium">After print, still editable</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Dynamic codes with a short redirect</li>
            <li>Scan counts and pause/resume</li>
            <li>Unlimited static library</li>
            <li>API keys for CI jobs</li>
          </ul>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/pricing">See plans</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl font-medium tracking-tight">FAQ</h2>
        <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-6 py-4">
              <summary className="cursor-pointer list-none font-medium marker:content-none">
                {item.q}
              </summary>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}