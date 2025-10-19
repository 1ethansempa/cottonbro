import { putTest, putObject, getObject } from "./routes/r2";
import { cacheableProduct } from "./routes/bff-products";

export interface Env {
  R2: R2Bucket;
}

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

export default {
  async fetch(req, env): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;

    if (req.method === "OPTIONS")
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "content-type,authorization",
        },
      });

    if (pathname === "/healthz") return new Response("ok");

    /*
    if (req.method === "GET" && pathname === "/r2/put-test")
      return putTest(env);
    if (req.method === "POST" && pathname === "/r2/put")
      return putObject(req, env);
    if (req.method === "GET" && pathname === "/r2/get")
      return getObject(url, env);

    if (req.method === "GET" && pathname.startsWith("/bff/products/")) {
      const id = pathname.split("/").pop()!;
      return cacheableProduct(id, env);
    }
    */

    return json({ ok: false, error: "route not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
