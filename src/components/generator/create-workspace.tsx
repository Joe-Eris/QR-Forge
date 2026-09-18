import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, Copy, Save } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { saveCode } from "@/lib/codes";
import { canGenerate, encodeQr, versionHint } from "@/lib/qr/encode";
import { downloadFilename } from "@/lib/qr/filename";
import { emptyPayload, defaultName, serializePayload, TYPE_META } from "@/lib/qr/payloads";
import { renderRasterBlob, renderSvgString, svgToBlob, triggerDownload } from "@/lib/qr/render";
import {
  DEFAULT_OPTIONS,
  PAYLOAD_TYPES,
  type EncodeResult,
  type Payload,
  type PayloadType,
  type QrOptions,
} from "@/lib/qr/types";
import { upsertGuestCode } from "@/lib/guest-store";
import { PayloadForm } from "./payload-form";
import { QrPreview } from "./qr-preview";
import { DesignPanel } from "./design-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function CreateWorkspace({ initialType }: { initialType: PayloadType }) {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [payload, setPayload] = useState<Payload>(() => emptyPayload(initialType));
  const [options, setOptions] = useState<QrOptions>(DEFAULT_OPTIONS);
  const [name, setName] = useState("Untitled");
  const [encoded, setEncoded] = useState<EncodeResult | null>(null);
  const [stale, setStale] = useState(false);
  const [downloads, setDownloads] = useState(0);
  const debounce = useRef<number | null>(null);

  useEffect(() => {
    if (payload.type !== initialType) {
      setPayload(emptyPayload(initialType));
      setEncoded(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialType]);

  const validation = useMemo(() => canGenerate(payload, options), [payload, options]);

  useEffect(() => {
    setStale(true);
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      if (!validation.ok) {
        setEncoded(null);
        setStale(false);
        return;
      }
      try {
        setEncoded(encodeQr(validation.canonical, options));
      } catch {
        setEncoded(null);
      }
      setStale(false);
    }, 80);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [validation, options]);

  const hint = encoded ? versionHint(encoded.version, options.ecc, Boolean(options.logoDataUrl)) : null;
  const blockedReason = !validation.ok ? validation.message : encoded ? null : "Waiting for a valid payload.";

  async function download(format: "png" | "svg" | "jpeg") {
    if (!encoded || !validation.ok) return;
    const filename = downloadFilename(payload.type, format === "jpeg" ? "jpg" : format);
    if (format === "svg") {
      triggerDownload(svgToBlob(renderSvgString(encoded, options)), filename);
    } else {
      const blob = await renderRasterBlob(encoded, options, format);
      triggerDownload(blob, filename);
    }
    toast.success(`Downloaded ${filename}`);
    const next = downloads + 1;
    setDownloads(next);
    rememberGuest();
  }

  async function copyPng() {
    if (!encoded) return;
    try {
      const blob = await renderRasterBlob(encoded, options, "png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Copied image");
    } catch {
      toast.error("Clipboard image is not available in this browser");
    }
  }

  function rememberGuest() {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const svg = encoded ? renderSvgString(encoded, options) : null;
    upsertGuestCode({
      id,
      name: name.trim() || defaultName(payload),
      payloadType: payload.type,
      payload,
      options,
      thumbnailSvg: svg,
      createdAt: now,
      updatedAt: now,
    });
  }

  async function onSave() {
    if (!encoded || !validation.ok) return;
    const label = name.trim() || defaultName(payload);
    const thumb = renderSvgString(encoded, options);
    if (!user) {
      rememberGuest();
      toast.message("Saved on this device", {
        description: "Sign in to keep codes across browsers.",
        action: {
          label: "Sign in",
          onClick: () => navigate({ to: "/login", search: { next: "/library" } }),
        },
      });
      return;
    }
    try {
      await saveCode({
        data: {
          name: label,
          payload,
          options,
          thumbnailSvg: thumb,
        },
      });
      toast.success("Saved to library");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  const ExportButtons = (
    <div className="flex flex-wrap gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button type="button" disabled={!encoded || !validation.ok} onClick={() => void download("png")}>
              <Download />
              Download PNG
            </Button>
          </span>
        </TooltipTrigger>
        {blockedReason ? <TooltipContent>{blockedReason}</TooltipContent> : null}
      </Tooltip>
      <Button type="button" variant="outline" disabled={!encoded || !validation.ok} onClick={() => void download("svg")}>
        SVG
      </Button>
      <Button type="button" variant="outline" disabled={!encoded || !validation.ok} onClick={() => void download("jpeg")}>
        JPEG
      </Button>
      <Button type="button" variant="secondary" disabled={!encoded} onClick={() => void copyPng()}>
        <Copy />
        Copy
      </Button>
      <Button type="button" variant="secondary" disabled={!encoded || !validation.ok} onClick={() => void onSave()}>
        <Save />
        {isPending ? "Save" : user ? "Save to library" : "Save on this device"}
      </Button>
    </div>
  );

  return (
    <div className="pb-24 lg:pb-8">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Workspace</p>
        <h1 className="font-display text-4xl font-medium tracking-tight">Create a static QR code</h1>
        <p className="max-w-2xl text-muted-foreground">
          Static locks the content inside the image. No account is required to download. Preview is the file — no watermark.
        </p>
      </div>

      <Tabs
        value={payload.type}
        onValueChange={(v) => {
          const type = v as PayloadType;
          setPayload(emptyPayload(type));
          navigate({ to: "/create", search: { type }, replace: true });
        }}
      >
        <TabsList className="w-full md:w-auto">
          {PAYLOAD_TYPES.map((type) => (
            <TabsTrigger key={type} value={type}>
              {TYPE_META[type].short}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{TYPE_META[payload.type].label}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </div>
            <PayloadForm
              payload={payload}
              onChange={setPayload}
              errorField={!validation.ok ? validation.field : undefined}
            />
            {!validation.ok ? (
              <p className="text-sm text-destructive" role="alert">
                {validation.message}
              </p>
            ) : (
              <p className="truncate font-mono text-xs text-muted-foreground">
                {serializePayload(payload).ok ? (serializePayload(payload) as { canonical: string }).canonical : ""}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-24 h-fit">
          <QrPreview
            encoded={encoded}
            options={options}
            payloadType={payload.type}
            isStale={stale}
            hint={hint}
          />
          <div className="mt-4 hidden lg:block">{ExportButtons}</div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Design</CardTitle>
          </CardHeader>
          <CardContent>
            <DesignPanel options={options} onChange={setOptions} />
          </CardContent>
        </Card>
      </div>

      <details className="mt-8 rounded-xl border border-border bg-card p-5">
        <summary className="cursor-pointer font-medium">Print checklist</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Outdoor poster: short URL, ECC M or H, printed width at least 4 cm.</li>
          <li>Business card: high contrast, light logo, printed width at least 2 cm.</li>
          <li>Matte finish. Do not crop the quiet zone.</li>
          <li>Test-scan before a bulk print run.</li>
        </ul>
      </details>

      {downloads >= 2 && !user && !isPending ? (
        <div className="mt-6 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          Save codes across devices —{" "}
          <Link to="/login" search={{ next: "/library" }} className="font-medium text-primary underline-offset-4 hover:underline">
            create a free account
          </Link>
          .
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        {ExportButtons}
      </div>
    </div>
  );
}
