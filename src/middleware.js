import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "../lib/auth";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "insecure-dev-secret-change-me"
);

const verify = async (token) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
};

const redirectTo = (req, pathname) => {
  const url = new URL("/sign-in", req.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
};

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verify(token) : null;

  // Admin area requires an authenticated admin.
  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      return redirectTo(req, pathname);
    }
  }

  // Customer-only routes.
  const protectedPaths = ["/cart", "/wishlist", "/orders", "/profile"];
  if (protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!session) return redirectTo(req, pathname);
  }

  // Signed-in users should not see the auth pages.
  if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart",
    "/wishlist",
    "/orders/:path*",
    "/profile",
    "/admin/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
