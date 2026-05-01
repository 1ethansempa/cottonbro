import { GoogleAuth, type IdTokenClient } from "google-auth-library";

const auth = new GoogleAuth();
const idTokenClients = new Map<string, Promise<IdTokenClient>>();

async function getIdTokenClient(audience: string) {
  if (!idTokenClients.has(audience)) {
    idTokenClients.set(audience, auth.getIdTokenClient(audience));
  }
  return idTokenClients.get(audience)!;
}

export async function mintApiIdToken(audience: string): Promise<string> {
  const client = await getIdTokenClient(audience);
  const headers = await client.getRequestHeaders();
  let authHeader: string | null | undefined;
  if (headers instanceof Headers) {
    authHeader = headers.get("Authorization") ?? headers.get("authorization");
  } else {
    const headerObj = headers as unknown as Record<string, string>;
    authHeader = headerObj["Authorization"] ?? headerObj["authorization"];
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Failed to mint ID token");
  }

  return authHeader.slice("Bearer ".length);
}
