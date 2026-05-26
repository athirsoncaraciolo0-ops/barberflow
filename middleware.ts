import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/login",
  "/manifest.json",
  "/favicon.ico",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath =
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth");

  if (isPublicPath) {
    return NextResponse.next();
  }

  const session = request.cookies.get("barberflow_session");

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
