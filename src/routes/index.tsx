import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { LandingPage } from "@/components/landing/landing-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QRForge — QR codes without the junk" },
      {
        name: "description",
        content:
          "Create scannable QR codes in the browser. No account needed for static PNG and SVG downloads.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "QRForge",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description: "Create scannable QR codes in the browser without an account for static downloads.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingPage />
    </SiteShell>
  );
}