import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Wordmark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/create" as const, label: "Create" },
  { to: "/scan" as const, label: "Scan" },
  { to: "/library" as const, label: "Library" },
  { to: "/pricing" as const, label: "Pricing" },
];

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-11 w-24 animate-pulse rounded-md bg-muted" aria-hidden />;
  }
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/account"
          className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
        >
          Account
        </Link>
        <UserButton />
      </div>
    );
  }
  return (
    <Button asChild size="sm">
      <Link to="/login" search={{ next: "/library" }}>
        Sign in
      </Link>
    </Button>
  );
}

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="shrink-0" aria-label="QRForge home">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.to && "bg-muted text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <AuthSlot />
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="mb-6">Menu</SheetTitle>
              <nav className="flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                <SignedOut>
                  <Link to="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-base font-medium hover:bg-muted">
                    Sign in
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link to="/account" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-base font-medium hover:bg-muted">
                    Account
                  </Link>
                  <div className="px-3 py-3">
                    <UserButton />
                  </div>
                </SignedIn>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
