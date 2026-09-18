import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { CreateWorkspace } from "@/components/generator/create-workspace";
import { isPayloadType } from "@/lib/qr/payloads";
import type { PayloadType } from "@/lib/qr/types";

export const Route = createFileRoute("/create")({
  validateSearch: (search: Record<string, unknown>): { type?: PayloadType } => {
    const raw = typeof search.type === "string" ? search.type : undefined;
    if (raw && isPayloadType(raw)) return { type: raw };
    return {};
  },
  head: () => ({
    meta: [
      { title: "QRForge — Create a QR code" },
      {
        name: "description",
        content: "Generate a static QR code in the browser. Download PNG or SVG with no account.",
      },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const { type } = Route.useSearch();
  return (
    <SiteShell>
      <CreateWorkspace initialType={type ?? "url"} />
    </SiteShell>
  );
}