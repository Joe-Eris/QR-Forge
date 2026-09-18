import { cn } from "@/lib/utils";
import { ErisByline } from "@/components/brand/eris";

export function QrMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-primary" />
      <rect x="5" y="5" width="9" height="9" rx="1.2" className="fill-primary-foreground" />
      <rect x="7.4" y="7.4" width="4.2" height="4.2" className="fill-primary" />
      <rect x="18" y="5" width="9" height="9" rx="1.2" className="fill-primary-foreground" />
      <rect x="20.4" y="7.4" width="4.2" height="4.2" className="fill-primary" />
      <rect x="5" y="18" width="9" height="9" rx="1.2" className="fill-primary-foreground" />
      <rect x="7.4" y="20.4" width="4.2" height="4.2" className="fill-primary" />
      <rect x="18" y="18" width="3" height="3" className="fill-primary-foreground" />
      <rect x="24" y="18" width="3" height="3" className="fill-primary-foreground" />
      <rect x="21" y="21" width="3" height="3" className="fill-primary-foreground" />
      <rect x="18" y="24" width="3" height="3" className="fill-primary-foreground" />
      <rect x="24" y="24" width="3" height="3" className="fill-primary-foreground" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <QrMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-medium tracking-tight text-foreground">QRForge</span>
        <ErisByline className="mt-0.5" />
      </span>
    </span>
  );
}