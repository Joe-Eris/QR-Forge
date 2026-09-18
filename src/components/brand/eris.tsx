import { cn } from "@/lib/utils";

/** Globe + ring from the Eris lockup. */
export function ErisPlanet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-5", className)} aria-hidden="true">
      <ellipse
        cx="16"
        cy="16.4"
        rx="13.2"
        ry="4.35"
        transform="rotate(-24 16 16.4)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="16" cy="15" r="7.15" fill="currentColor" />
      <path
        d="M4.6 18.4c2.4-.7 4.6-1.1 6.6-1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        transform="rotate(-24 16 16.4)"
      />
    </svg>
  );
}

export function ErisByline({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground", className)}>
      <ErisPlanet className="size-3.5 text-foreground" />
      <span className="text-[10px] font-medium tracking-[0.18em] uppercase">Eris</span>
    </span>
  );
}

export function ErisLockup({ className }: { className?: string }) {
  return (
    <figure className={cn("flex items-center gap-3", className)}>
      <img
        src="/brand/eris-lockup.png"
        alt="Eris — Evolving Innovation"
        width={160}
        height={134}
        className="h-14 w-auto rounded-md bg-ink ring-1 ring-border"
      />
      <figcaption className="text-xs leading-relaxed text-muted-foreground">
        <span className="block font-medium tracking-[0.14em] text-foreground uppercase">A product of Eris</span>
        Evolving Innovation. QRForge is owned and operated by Eris.
      </figcaption>
    </figure>
  );
}
