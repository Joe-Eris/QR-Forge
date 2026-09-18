import { Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";

export function NotFound() {
  return (
    <SiteShell>
      <main className="mx-auto flex min-h-[50dvh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase">404</p>
        <h1 className="font-display text-4xl font-medium text-foreground">This page is not on the matrix</h1>
        <p className="text-muted-foreground">The route does not exist. Create a code or go back home.</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Home
          </Link>
          <Link
            to="/create"
            className="inline-flex h-11 items-center rounded-md border border-border bg-card px-4 text-sm font-medium"
          >
            Create a QR code
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}