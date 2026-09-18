import { Link } from "@tanstack/react-router";
import { ErisLockup } from "@/components/brand/eris";

const LINKS = [
  { to: "/create" as const, label: "Create" },
  { to: "/scan" as const, label: "Scan" },
  { to: "/library" as const, label: "Library" },
  { to: "/pricing" as const, label: "Pricing" },
  { to: "/privacy" as const, label: "Privacy" },
  { to: "/terms" as const, label: "Terms" },
  { to: "/privacy" as const, hash: "contact", label: "Contact" },
];

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg font-medium">QRForge</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Scannable QR codes in the browser. Guest downloads stay on your device.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground" aria-label="Footer">
            {LINKS.map((l) => (
              <Link key={l.label} to={l.to} hash={"hash" in l ? l.hash : undefined} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <ErisLockup />
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Eris. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}