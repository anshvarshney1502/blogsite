import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function verifySessionToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "fallback-dev-secret";
  const encoder = new TextEncoder();
  
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
    
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode("authenticated")
    );
    
    const hashArray = Array.from(new Uint8Array(signature));
    const expectedHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (token.length !== expectedHex.length) return false;
    
    // Constant time comparison
    let mismatch = 0;
    for (let i = 0; i < token.length; i++) {
      mismatch |= token.charCodeAt(i) ^ expectedHex.charCodeAt(i);
    }
    return mismatch === 0;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect /admin pages and /api/admin routes (except the login endpoints)
  if (
    (path.startsWith("/admin") && path !== "/admin/login") ||
    (path.startsWith("/api/admin") && path !== "/api/admin/login")
  ) {
    const sessionToken = request.cookies.get("admin_session")?.value ?? "";

    if (!(await verifySessionToken(sessionToken))) {
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
