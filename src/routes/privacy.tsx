import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "QRForge — Privacy" },
      { name: "description", content: "How QRForge handles payloads, accounts, and guest history." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteShell>
      <article className="prose-qr mx-auto max-w-2xl">
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Legal</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Privacy</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">Last updated 8 September 2026.</p>
        <div className="mt-8 space-y-6 text-[0.975rem] leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-medium">Guest generation</h2>
            <p className="mt-2 text-muted-foreground">
              If you generate a static code and download it without signing in, the payload is encoded in your browser.
              It is not sent to QRForge servers. Local history (up to 20 items) lives in your browser storage under a
              versioned key. Clearing site data deletes it.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-medium">Saved codes</h2>
            <p className="mt-2 text-muted-foreground">
              When you save to a library, we store the canonical payload and design options so you can reprint. Wi-Fi
              and contact cards are treated as sensitive: we will not silently upload them from guest history without
              your confirmation.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-medium">Accounts</h2>
            <p className="mt-2 text-muted-foreground">
              Sign-in uses Google, X, or email and password. We store the account email, session, and library rows
              scoped to your user id. You can export or delete saved codes from Account.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-medium">What we do not do</h2>
            <p className="mt-2 text-muted-foreground">
              We do not log payload contents. We do not bake tracking pixels into static files. We do not train models
              on your destinations. Scan analytics for dynamic codes are a later product phase and are not collected
              in this release.
            </p>
          </section>
          <section id="contact">
            <h2 className="font-display text-2xl font-medium">Contact</h2>
            <p className="mt-2 text-muted-foreground">
              Privacy questions: use the in-product account export, or reach the operator of this QRForge instance.
            </p>
          </section>
        </div>
      </article>
    </SiteShell>
  );
}