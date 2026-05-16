const DEFAULT_AUTH_REDIRECT = "/";
const DASHBOARD_AUTH_REDIRECT_PREFIX = "/dashboard";

export function getSafeAuthRedirectPath(value: string | null | undefined) {
  if (!value) return DEFAULT_AUTH_REDIRECT;
  if (!value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }
  if (!value.startsWith(DASHBOARD_AUTH_REDIRECT_PREFIX)) {
    return DEFAULT_AUTH_REDIRECT;
  }
  return value;
}
