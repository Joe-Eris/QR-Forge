import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "QRForge — Pricing" },
      { name: "description", content: "Free static QR codes now. Pro adds dynamic codes and analytics." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <SiteShell>
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Plans</p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Simple, honest pricing</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Payments are not live yet. The Free plan is available now. Pro and Business are listed so you can plan a print run.
      </p>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <Badge>Free</Badge>
          <p className="mt-4 font-display text-3xl font-medium">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>30 saved static codes / month</li>
            <li>Logo, SVG, PNG, JPEG</li>
            <li>Guest downloads unlimited</li>
            <li>No watermark on static files</li>
            <li>On-device scan decoder</li>
          </ul>
          <Button asChild className="mt-6 w-full">
            <Link to="/create" search={{ type: "url" }}>
              Create a QR code
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Badge variant="secondary">Pro · coming</Badge>
          <p className="mt-4 font-display text-3xl font-medium">Soon</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Unlimited static codes</li>
            <li>50 active dynamic codes</li>
            <li>13 months of scan analytics</li>
            <li>Limited public API</li>
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Badge variant="secondary">Business · coming</Badge>
          <p className="mt-4 font-display text-3xl font-medium">Soon</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>500+ dynamic codes</li>
            <li>10 seats included</li>
            <li>25 months analytics</li>
            <li>Full API</li>
          </ul>
        </div>
      </div>
    </SiteShell>
  );
}