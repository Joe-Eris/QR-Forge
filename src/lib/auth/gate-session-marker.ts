/**
 * Marker for host-minted sessions. Sign-out is a no-op for those sessions,
 * so UserButton hides its sign-out control. `__Host-` cookies cannot carry
 * a Domain attribute.
 */
export const GATE_SESSION_MARKER_COOKIE = "__Host-eris_gate_session";

export function hasGateSessionMarker(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((pair) => pair.trim().startsWith(`${GATE_SESSION_MARKER_COOKIE}=`));
}
