import { contrastGate } from "@/lib/qr/contrast";
import { maxLogoScale } from "@/lib/qr/encode";
import { rasterizeLogo } from "@/lib/qr/render";
import { DEFAULT_OPTIONS, MODULE_SCALES, type EccLevel, type QrOptions } from "@/lib/qr/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const PRESETS: Array<{ name: string; patch: Partial<QrOptions> }> = [
  { name: "Monochrome", patch: { fg: "#0F172A", bg: "#FFFFFF" } },
  { name: "High contrast", patch: { fg: "#000000", bg: "#FFFFFF" } },
  { name: "Brand", patch: { fg: "#0369A1", bg: "#F8FAFC" } },
  { name: "Inverse", patch: { fg: "#F8FAFC", bg: "#0F172A" } },
];

export function DesignPanel({
  options,
  onChange,
}: {
  options: QrOptions;
  onChange: (next: QrOptions) => void;
}) {
  const gate = contrastGate(options.fg, options.bg);
  const logoMax = maxLogoScale(options.ecc);

  async function onLogo(file: File | undefined) {
    if (!file) return;
    try {
      const dataUrl = await rasterizeLogo(file);
      const ecc = options.ecc === "L" ? "H" : options.ecc;
      onChange({
        ...options,
        logoDataUrl: dataUrl,
        ecc,
        logoScale: Math.min(options.logoScale, maxLogoScale(ecc) || 0.18),
      });
      if (options.ecc === "L") toast.message("Error correction raised to H for the logo.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not use that logo");
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button key={p.name} type="button" size="sm" variant="outline" onClick={() => onChange({ ...options, ...p.patch })}>
              {p.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="fg">Modules</Label>
          <div className="flex gap-2">
            <input
              aria-label="Module color"
              type="color"
              className="size-11 shrink-0 cursor-pointer rounded-md border border-input bg-card"
              value={options.fg}
              onChange={(e) => onChange({ ...options, fg: e.target.value })}
            />
            <Input
              id="fg"
              value={options.fg}
              onChange={(e) => onChange({ ...options, fg: e.target.value })}
              className="font-mono uppercase"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bg">Background</Label>
          <div className="flex gap-2">
            <input
              aria-label="Background color"
              type="color"
              className="size-11 shrink-0 cursor-pointer rounded-md border border-input bg-card"
              value={options.bg}
              onChange={(e) => onChange({ ...options, bg: e.target.value })}
            />
            <Input
              id="bg"
              value={options.bg}
              onChange={(e) => onChange({ ...options, bg: e.target.value })}
              className="font-mono uppercase"
            />
          </div>
        </div>
      </div>

      {gate.message ? (
        <p
          className={
            gate.status === "block"
              ? "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              : "rounded-md bg-muted px-3 py-2 text-sm text-foreground"
          }
          role={gate.status === "block" ? "alert" : "status"}
        >
          {gate.message}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground tabular-nums">Contrast {gate.ratio.toFixed(2)}:1</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Error correction</Label>
          <Select
            value={options.ecc}
            onValueChange={(v) => {
              const ecc = v as EccLevel;
              if (options.logoDataUrl && ecc === "L") return;
              onChange({ ...options, ecc });
            }}
          >
            <SelectTrigger aria-label="Error correction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">L · 7%</SelectItem>
              <SelectItem value="M">M · 15%</SelectItem>
              <SelectItem value="Q">Q · 25%</SelectItem>
              <SelectItem value="H">H · 30%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Module size</Label>
          <Select
            value={String(options.modulePx)}
            onValueChange={(v) => onChange({ ...options, modulePx: Number(v) })}
          >
            <SelectTrigger aria-label="Module size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODULE_SCALES.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} px / module
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="quiet">Quiet zone (modules)</Label>
        <Input
          id="quiet"
          type="number"
          min={4}
          max={16}
          value={options.quietZoneModules}
          onChange={(e) =>
            onChange({ ...options, quietZoneModules: Math.max(4, Number(e.target.value) || 4) })
          }
        />
        <p className="text-xs text-muted-foreground">Minimum 4. Never decrease below that.</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="caption">Caption (optional, not in the QR)</Label>
        <Input
          id="caption"
          maxLength={48}
          value={options.caption}
          placeholder="Scan for menu"
          onChange={(e) => onChange({ ...options, caption: e.target.value.slice(0, 48) })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="logo">Center logo</Label>
        <Input
          id="logo"
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={(e) => void onLogo(e.target.files?.[0])}
        />
        {options.logoDataUrl ? (
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Logo on · max {Math.round(logoMax * 100)}% width at {options.ecc}</span>
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ ...options, logoDataUrl: null })}>
              Remove
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">PNG, SVG, JPEG. Refused at ECC L. Auto-padded so finders stay clear.</p>
        )}
      </div>

      <Button type="button" variant="secondary" onClick={() => onChange({ ...DEFAULT_OPTIONS })}>
        Reset to defaults
      </Button>
    </div>
  );
}
