import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// List of routes to revalidate after publishing
const routes = [
  "/",
  "/about",
  "/archive",
  "/articles",
  "/topics",
  "/series",
  "/admin",
  "/admin/homepage",
  "/admin/settings",
  // add more if you have dynamic routes
];

export async function POST() {
  try {
    // Trigger revalidation for each route
    for (const r of routes) {
      revalidatePath(r);
    }
    return NextResponse.json({ success: true, message: "Site published and routes revalidated" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to publish site" }, { status: 500 });
  }
}

export async function GET() {
  // For convenience, allow GET as well
  return POST();
}
