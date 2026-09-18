import { useMemo } from "react";
import { renderSvgString, svgForHtml } from "@/lib/qr/render";
import { printSizeMm } from "@/lib/qr/filename";
import type { EncodeResult, PayloadType, QrOptions } from "@/lib/qr/types";
import { TYPE_META } from "@/lib/qr/payloads";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function QrPreview({
  encoded,
  options,
  payloadType,
  isStale,
  hint,
}: {
  encoded: EncodeResult | null;
  options: QrOptions;
  payloadType: PayloadType;
  isStale: boolean;
  hint: string | null;
}) {
  const svg = useMemo(() => {
    if (!encoded) return null;
    return svgForHtml(renderSvgString(encoded, options));
  }, [encoded, options]);

  const edge = encoded ? encoded.size * options.modulePx : 0;
  const mm = printSizeMm(edge);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "relative flex aspect-square w-full max-w-sm items-center justify-center rounded-xl border border-border bg-card p-5 transition-opacity",
          isStale && "opacity-60",
        )}
      >
        {svg ? (
          <div
            className="w-full"
            // Preview is generated from the same encoder as downloads.
            dangerouslySetInnerHTML={{ __html: svg }}
            aria-live="polite"
            aria-label={`QR code for ${TYPE_META[payloadType].label}`}
          />
        ) : (
          <p className="px-6 text-center text-sm text-muted-foreground">
            Enter a payload to preview a live matrix. The file you download is this preview.
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {encoded ? (
          <Badge variant="outline" className="font-mono tabular-nums">
            Version {encoded.version} · {encoded.size}×{encoded.size}
          </Badge>
        ) : (
          <Badge variant="secondary">No matrix</Badge>
        )}
        {encoded ? (
          <Badge variant="outline" className="tabular-nums">
            {edge} px · ~{mm.toFixed(0)} mm at 300 DPI
          </Badge>
        ) : null}
        <Badge variant="secondary">Static</Badge>
      </div>
      <p className="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        QRForge · Eris
      </p>
      {hint ? <p className="max-w-sm text-center text-xs text-muted-foreground">{hint}</p> : null}
      {options.modulePx * (encoded?.size ?? 0) < 128 && encoded ? (
        <p className="max-w-sm text-center text-xs text-destructive">
          Under 128 px is hard to scan from a phone. Increase module size.
        </p>
      ) : null}
    </div>
  );
}
