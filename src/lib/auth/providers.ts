/**
 * Optional social sign-in. Empty = email/password only (QRForge on Vercel).
 */
export type OAuthProvider = {
  providerId: string;
  idp: string;
  label: string;
};

export const OAUTH_PROVIDERS: readonly OAuthProvider[] = [];
