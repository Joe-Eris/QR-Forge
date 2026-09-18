import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { LibraryView } from "@/components/library/library-view";

export const Route = createFileRoute("/library/")({
  head: () => ({
    meta: [
      { title: "QRForge — Library" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  return (
    <SiteShell>
      <LibraryView />
    </SiteShell>
  );
}