export type GetBearerToken = (forceRefresh?: boolean) => Promise<string | null>;

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

    const createBearerRequest = createBearerRequestFactory(input, requestInit);

    const firstResponse = await fetch(createBearerRequest(firstToken));
    if (firstResponse.status !== 401) {
      return firstResponse;
    }

    const retryToken = await getBearerToken(true);
    if (!retryToken || retryToken === firstToken) {
      return firstResponse;
    }

    return fetch(createBearerRequest(retryToken));
  };
}

export function createSessionNetworkRequest(): NetworkRequest {
  return async (input, init) => {
    const {
      protected: isProtected = true,
      token = "session",
      ...requestInit
    } = init ?? {};

    if (!isProtected) {
      return fetch(input, requestInit);
    }

    if (token !== "session") {
      throw new Error("session_request_does_not_support_bearer_token");
    }

    return fetch(input, {
      ...requestInit,
      credentials: requestInit.credentials ?? "include",
    });
  };
}

export const sessionNetworkRequest = createSessionNetworkRequest();

function createBearerRequestFactory(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): (token: string) => Request {
  const baseRequest = new Request(input, {
    ...init,
    credentials: init?.credentials ?? "include",
  });

  return (token) => {
    const request = baseRequest.clone();
    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${token}`);

    return new Request(request, { headers });
  };
}
