import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { ScanWorkspace } from "@/components/scan/scan-workspace";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "QRForge — Scan a QR code" },
      {
        name: "description",
        content: "Decode a QR code from a photo or camera in the browser. Images never leave your device.",
      },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  return (
    <SiteShell>
      <ScanWorkspace />
    </SiteShell>
  );
}