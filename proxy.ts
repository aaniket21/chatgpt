import NextAuth from "next-auth";
import authConfig from "@/server/auth.config";
const { auth } = NextAuth(authConfig);
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/share"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAuthApi = pathname.startsWith("/api/auth");

  // Allow public routes and auth API
  if (isPublicRoute || isAuthApi) {
    // If logged in and trying to access auth pages, redirect to chat
    if (req.auth?.user && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files, images, and favicon
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
