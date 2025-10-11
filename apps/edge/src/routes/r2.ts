export async function putTest(env: { R2: R2Bucket }) {
  const key = `tests/hello-${crypto.randomUUID()}.txt`;
  await env.R2.put(key, "hello from cottonbro", {
    httpMetadata: { contentType: "text/plain" },
  });
  return new Response(JSON.stringify({ ok: true, key }), {
    headers: { "content-type": "application/json" },
  });
}

export async function putObject(req: Request, env: { R2: R2Bucket }) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || `uploads/${crypto.randomUUID()}`;
  const ct = req.headers.get("content-type") || "application/octet-stream";
  await env.R2.put(key, req.body, { httpMetadata: { contentType: ct } });
  return new Response(JSON.stringify({ ok: true, key, contentType: ct }), {
    headers: { "content-type": "application/json" },
  });
}

export async function getObject(url: URL, env: { R2: R2Bucket }) {
  const key = url.searchParams.get("key");
  if (!key)
    return new Response(JSON.stringify({ ok: false, error: "missing key" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  const obj = await env.R2.get(key);
  if (!obj)
    return new Response(JSON.stringify({ ok: false, error: "not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  const headers = new Headers();
  const md = obj.httpMetadata ?? {};
  if (md.contentType) headers.set("content-type", md.contentType);
  if (md.contentDisposition)
    headers.set("content-disposition", md.contentDisposition);
  if (md.cacheControl) headers.set("cache-control", md.cacheControl);
  return new Response(obj.body, { headers });
}
