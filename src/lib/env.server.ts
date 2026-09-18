export function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

/**
 * Local sandbox vs a real deploy (Vercel). Vercel sets `VERCEL=1`.
 * Gate audience and connector-token semantics key off this.
 */
export function isWorkspacePreview(): boolean {
  if (env("VERCEL") || env("BETTER_AUTH_URL")) return false;
  return !env("GROK_PROJECT_ID");
}
