import { useState, type FormEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function safeNext(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/library";
  return next;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { next?: string } => ({
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  head: () => ({
    meta: [{ title: "QRForge — Sign in" }, { name: "robots", content: "noindex" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { next } = Route.useSearch();
  const dest = safeNext(next);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    setPending(true);
    try {
      if (mode === "signup") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0] ?? "QRForge",
          callbackURL: dest,
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: dest,
        });
        if (err) throw new Error(err.message);
      }
      window.location.href = dest;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto grid max-w-md gap-6 py-6">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Account</p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Required only to save a cloud library. Guest downloads never need an account.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{authEnabled ? "Continue" : "Sign-in is disabled"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {authEnabled ? (
              <>
                {GROK_PROVIDERS.map((p) => (
                  <Button
                    key={p.providerId}
                    type="button"
                    variant="outline"
                    onClick={() => void signIn(p.providerId, { callbackURL: dest })}
                  >
                    Continue with {p.label}
                  </Button>
                ))}
                <p className="py-2 text-center text-xs tracking-widest text-muted-foreground uppercase">or email</p>
                <form className="grid gap-3" onSubmit={(e) => void onEmail(e)}>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      required
                      minLength={10}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">At least 10 characters.</p>
                  </div>
                  {error ? (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <Button type="submit" disabled={pending}>
                    {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in with email"}
                  </Button>
                </form>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
                </button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sign-in is disabled in this environment.</p>
            )}
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/create" search={{ type: "url" }} className="hover:text-foreground">
            Continue as guest
          </Link>
        </p>
      </div>
    </SiteShell>
  );
}