/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const DB_PATH = path.join(process.cwd(), "content/db.json");

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDb(data: unknown) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── GET: return full db.json
export async function GET() {
  try {
    return NextResponse.json(readDb());
  } catch {
    return NextResponse.json({ error: "Failed to read db" }, { status: 500 });
  }
}

// ── PUT: save draft (no revalidation)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    writeDb(body);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ── POST: publish — save + revalidate all public pages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    writeDb(body);

    // Revalidate all public routes
    const routes = ["/", "/about", "/articles", "/topics", "/series", "/archive", "/writings"];
    for (const route of routes) {
      revalidatePath(route);
    }

    return NextResponse.json({ success: true, publishedAt: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
