import type { ReactNode } from "react";
import { AppHeader } from "./app-header";
import { AppFooter } from "./app-footer";

export function SiteShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <div id="main" className={wide ? "flex-1" : "mx-auto w-full max-w-6xl flex-1 px-4 py-8"}>
        {children}
      </div>
      <AppFooter />
    </div>
  );
}