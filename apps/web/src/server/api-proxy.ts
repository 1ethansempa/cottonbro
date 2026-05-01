export type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

//get real backend url
export function getApiBaseUrl() {
  const baseUrl = process.env.API_BASE_URL?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("Missing API_BASE_URL");
  }

  return baseUrl;
}

//reject cross origin calls
export function isSameOrigin(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    return origin === requestOrigin;
  }

  if (referer) {
    return new URL(referer).origin === requestOrigin;
  }

  return false;
}

//copy important request headers
function buildProxyHeaders(request: Request) {
  const headers = new Headers();
  //Needed when forwarding JSON bodies.
  const contentType = request.headers.get("content-type");
  //Browser sends the HttpOnly cookie automatically:
  const cookie = request.headers.get("cookie");
  //can help backend logging, abuse detection, or analytics.
  const userAgent = request.headers.get("user-agent");

  if (contentType) headers.set("content-type", contentType);
  if (cookie) headers.set("cookie", cookie);
  if (userAgent) headers.set("user-agent", userAgent);

  return headers;
}

//copies cookies from the backend API response onto the Next response
// that goes back to the browser.
// e.g Browser -> Next /api/auth/login -> Backend /v1/auth/login
// The backend creates the session cookie but the browser did not call the
// backend directly. It called Next. So Next must copy that Set-Cookie header
// onto its own response.
//source = backend response headers
// target = headers for the response Next will send to browser
function copySetCookie(source: Headers, target: Headers) {
  const getSetCookie = (source as Headers & { getSetCookie?: () => string[] })
    .getSetCookie;
  const cookies = getSetCookie?.call(source);

  if (cookies?.length) {
    for (const cookie of cookies) {
      target.append("set-cookie", cookie);
    }

    return;
  }

  const cookie = source.get("set-cookie");
  if (cookie) {
    target.append("set-cookie", cookie);
  }
}

//creates the real backend URL that Next will call.
function buildBackendUrl(path: string, request: Request) {
  return `${getApiBaseUrl()}/${path}${new URL(request.url).search}`;
}

// main forward this request to the backend function
// receives request: the incoming browser request to Next,
// path: the backend path to call, for example auth/login
// Example: browser calls /api/auth/login.
// The auth route passes path="auth/login".
// This proxy calls ${API_BASE_URL}/auth/login from the Next server,
export async function proxyApiRequest(request: Request, path: string) {
  // then returns the backend status/body/cookies to the browser.
  // before proxying anything, check that request came from same
  // origin as web app
  if (!isSameOrigin(request)) {
    return new Response("Forbidden", { status: 403 });
  }

  // GET/HEAD do not have bodies.
  // For POST, it reads the raw body as an ArrayBuffer. That preserves JSON exactly as sent by the client.
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const backendResponse = await fetch(buildBackendUrl(path, request), {
    method: request.method,
    headers: buildProxyHeaders(request),
    body,
    // this means if the backend returns a redirect response like: 302 Location: /somewhere
    // the Next proxy should not automatically follow it.
    // Instead, the proxy receives the redirect response and can return it to the browser as-is:
    redirect: "manual",
  });

  //Builds response headers for browser
  //It copies important backend response headers back to the browser response.
  const headers = new Headers();
  const contentType = backendResponse.headers.get("content-type");
  const location = backendResponse.headers.get("location");

  if (contentType) headers.set("content-type", contentType);
  if (location) headers.set("location", location);
  copySetCookie(backendResponse.headers, headers);

  // If backend returns no body (204) or not modified (304), response body must be null.
  // Otherwise it copies the backend body exactly.
  const responseBody =
    backendResponse.status === 204 || backendResponse.status === 304
      ? null
      : await backendResponse.arrayBuffer();

  // Returns backend result to browser
  return new Response(responseBody, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers,
  });
}
