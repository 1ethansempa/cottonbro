export type GetBearerToken = () => Promise<string | null>;

export type NetworkRequestToken = "session" | "bearer";

export type NetworkRequestInit = RequestInit & {
  protected?: boolean;
  token?: NetworkRequestToken;
};

export type NetworkRequest = (
  input: RequestInfo | URL,
  init?: NetworkRequestInit,
) => Promise<Response>;

export function createNetworkRequest(
  getBearerToken: GetBearerToken,
): NetworkRequest {
  return async (input, init) => {
    const {
      protected: isProtected = true,
      token = "session",
      ...requestInit
    } = init ?? {};

    if (!isProtected) {
      return fetch(input, requestInit);
    }

    if (token === "session") {
      return fetch(input, {
        ...requestInit,
        credentials: requestInit.credentials ?? "include",
      });
    }

    const firstToken = await getBearerToken();
    if (!firstToken) {
      throw new Error("missing_bearer_token");
    }

    const firstResponse = await fetchWithBearer(input, requestInit, firstToken);
    if (firstResponse.status !== 401) {
      return firstResponse;
    }

    const retryToken = await getBearerToken();
    if (!retryToken || retryToken === firstToken) {
      return firstResponse;
    }

    return fetchWithBearer(input, requestInit, retryToken);
  };
}

function fetchWithBearer(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  token: string,
) {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, {
    ...init,
    credentials: init?.credentials ?? "include",
    headers,
  });
}
