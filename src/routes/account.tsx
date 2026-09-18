import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { deleteAllMyCodes, exportMyCodes } from "@/lib/codes";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "QRForge — Account" }, { name: "robots", content: "noindex" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <SiteShell>
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </SiteShell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  async function onExport() {
    setBusy(true);
    try {
      const data = await exportMyCodes();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrforge-export.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteLibrary() {
    if (!window.confirm("Soft-delete every saved code in your library?")) return;
    setBusy(true);
    try {
      await deleteAllMyCodes();
      toast.success("Library cleared");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Account</p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Your profile</h1>
      <div className="mt-8 grid gap-4 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>
              <span className="text-muted-foreground">Name · </span>
              {user.displayName ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Email · </span>
              {user.primaryEmail ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={() => void onExport()}>
              Export library JSON
            </Button>
            <Button type="button" variant="destructive" disabled={busy} onClick={() => void onDeleteLibrary()}>
              Delete saved codes
            </Button>
          </CardContent>
        </Card>
      </div>
    </SiteShell>
  );
}