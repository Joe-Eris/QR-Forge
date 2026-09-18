import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "QRForge — Terms" },
      { name: "description", content: "Terms of use for QRForge static QR generation and library." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl">
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Terms</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">Last updated 8 September 2026.</p>
        <div className="mt-8 space-y-6 text-[0.975rem] leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-medium">Use of the service</h2>
            <p className="mt-2 text-muted-foreground">
              QRForge lets you encode payloads into QR matrices and download PNG, SVG, or JPEG files. You are
              responsible for the destinations you encode. Do not use the product to distribute malware, phishing
              pages, or unlawful content.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-medium">Static codes</h2>
            <p className="mt-2 text-muted-foreground">
              A static file contains the payload itself. QRForge cannot change a printed static code after download.
              Dynamic editable codes are described on Pricing and are not included in this release.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-medium">No warranty of every scanner</h2>
            <p className="mt-2 text-muted-foreground">
              We enforce quiet zone, contrast, and logo rules because they improve scan rates. We do not certify
              every industrial scanner or damaged print. Test-scan before a bulk run.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-medium">Accounts and limits</h2>
            <p className="mt-2 text-muted-foreground">
              Free saved codes are capped per month. We may suspend accounts that abuse generation, storage, or
              authentication endpoints.
            </p>
          </section>
        </div>
      </article>
    </SiteShell>
  );
}