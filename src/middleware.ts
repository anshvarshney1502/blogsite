import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

function verifySessionToken(token: string): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "fallback-dev-secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update("authenticated")
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect /admin pages and /api/admin routes (except the login endpoints)
  if (
    (path.startsWith("/admin") && path !== "/admin/login") ||
    (path.startsWith("/api/admin") && path !== "/api/admin/login")
  ) {
    const sessionToken = request.cookies.get("admin_session")?.value ?? "";

    if (!verifySessionToken(sessionToken)) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
