/**
 * Preview-only OAuth fallback (server-only — never import from the client).
 * On Vercel, set AUTH / BETTER_AUTH env vars instead; these defaults are unused.
 */
export const PREVIEW_CLIENT_ID = "eris_preview";
export const PREVIEW_CLIENT_SECRET =
  "8bcdb7fc5a33874ad933ca568918d5790388a0795e44c4d1dea691f801b17ec5";

export const AUTH_ISSUER_DEFAULT = "";

export const PREVIEW_ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "*.grok-sandbox.com",
] as const;
