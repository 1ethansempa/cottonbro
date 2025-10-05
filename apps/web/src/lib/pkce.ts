// client-only helpers
export async function generateCodeVerifier(len = 64) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
  let v = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) v += chars[arr[i] % chars.length];
  return v;
}

async function sha256(str: string) {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return new Uint8Array(hash);
}

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...Array.from(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function codeChallengeFromVerifier(verifier: string) {
  return base64url(await sha256(verifier));
}
