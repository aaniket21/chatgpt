import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAuthApi = pathname.startsWith("/api/auth");

  // Allow public routes and auth API
  if (isPublicRoute || isAuthApi) {
    // If logged in and trying to access auth pages, redirect to chat
    if (session?.user && isPublicRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, images, and favicon
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
