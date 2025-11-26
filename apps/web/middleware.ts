import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  console.log("[Middleware] Running for:", request.nextUrl.pathname);
  
  // Add pathname as a header so server layouts can access it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  
  console.log("[Middleware] Set x-pathname header to:", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Match all routes except Next.js internals
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
