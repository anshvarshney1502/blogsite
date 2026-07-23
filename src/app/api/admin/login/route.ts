import { NextResponse } from "next/server";
import crypto from "crypto";

// ── Constant-time string comparison to prevent timing attacks ────────────────
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run timingSafeEqual on equal-length dummy buffers to avoid leak
    crypto.timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32));
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// ── Rate-limiting (in-memory, per IP) ───────────────────────────────────────
const attempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Check lockout
  const record = attempts.get(ip);
  if (record && Date.now() < record.blockedUntil) {
    const remaining = Math.ceil((record.blockedUntil - Date.now()) / 1000 / 60);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${remaining} minute(s).` },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();

    // Read credentials from environment variables ONLY
    const expectedUser = process.env.ADMIN_USERNAME ?? "";
    const expectedPass = process.env.ADMIN_PASSWORD ?? "";
    const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "fallback-dev-secret";

    if (!expectedUser || !expectedPass) {
      console.error("ADMIN_USERNAME / ADMIN_PASSWORD env vars not set.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const valid =
      safeCompare(username ?? "", expectedUser) &&
      safeCompare(password ?? "", expectedPass);

    if (valid) {
      // Clear failed attempts
      attempts.delete(ip);

      // Build a signed session token: HMAC of "authenticated" with the secret
      const token = crypto
        .createHmac("sha256", sessionSecret)
        .update("authenticated")
        .digest("hex");

      const response = NextResponse.json({ success: true });
      response.cookies.set("admin_session", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8-hour session
      });
      return response;
    }

    // Track failed attempt
    const cur = attempts.get(ip) ?? { count: 0, blockedUntil: 0 };
    cur.count += 1;
    if (cur.count >= MAX_ATTEMPTS) {
      cur.blockedUntil = Date.now() + LOCKOUT_MS;
    }
    attempts.set(ip, cur);

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
