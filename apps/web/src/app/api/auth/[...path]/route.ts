import { createProxyRouteHandlers } from "@/server/api-proxy";

export const runtime = "nodejs";

export const { GET, POST, PUT } = createProxyRouteHandlers("auth");
