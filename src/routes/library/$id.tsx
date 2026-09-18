import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { CodeDetail } from "@/components/library/code-detail";

export const Route = createFileRoute("/library/$id")({
  head: () => ({
    meta: [
      { title: "QRForge — Code" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DetailPage,
});

function DetailPage() {
  const { id } = Route.useParams();
  return (
    <SiteShell>
      <CodeDetail id={id} />
    </SiteShell>
  );
}