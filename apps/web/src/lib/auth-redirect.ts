/**
 * Clamp a user-supplied `?redirect=` value to dashboard paths only.
 * Anything else (missing, external, wrong prefix) just goes home.
 */
export function safeRedirect(to: string | null | undefined): string {
  if (!to || !to.startsWith("/") || to.startsWith("//")) return "/";
  return to.startsWith("/dashboard") ? to : "/";
}
