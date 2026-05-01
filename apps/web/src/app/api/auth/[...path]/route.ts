import { proxyApiRequest, type RouteContext } from "@/server/api-proxy";

export const runtime = "nodejs";

async function proxyAuthRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const authPath = path.map(encodeURIComponent).join("/");

  return proxyApiRequest(request, `auth/${authPath}`);
}

export async function GET(request: Request, context: RouteContext) {
  return proxyAuthRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxyAuthRequest(request, context);
}
