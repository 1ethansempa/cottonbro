export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const doFetch = () => fetch(input, { ...init, credentials: "include" });

  let res = await doFetch();
  if (res.status !== 401) return res;

  // try one silent refresh
  const refresh = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!refresh.ok) return res; // still 401, caller decides

  // retry original request
  res = await doFetch();
  return res;
}
