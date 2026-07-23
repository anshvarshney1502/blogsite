/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const PAGES_DIR = path.join(process.cwd(), "content/pages");

// Ensure pages directory exists
if (!fs.existsSync(PAGES_DIR)) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
}

// ── GET: load blocks for a page slug
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = path.join(PAGES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ blocks: [] });
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to read page" }, { status: 500 });
  }
}

// ── PUT: save draft (blocks only, no revalidate)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await req.json();
    const filePath = path.join(PAGES_DIR, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ blocks: body.blocks, updatedAt: new Date().toISOString() }, null, 2));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ── POST: publish (save + revalidate public pages)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await req.json();
    const filePath = path.join(PAGES_DIR, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify({
      blocks: body.blocks,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    }, null, 2));

    // Revalidate the public-facing route(s)
    const routeMap: Record<string, string[]> = {
      home:    ["/", "/articles", "/topics", "/series"],
      about:   ["/about"],
      archive: ["/archive"],
    };
    const routes = routeMap[slug] ?? [`/${slug}`];
    for (const route of routes) {
      revalidatePath(route);
    }

    return NextResponse.json({ success: true, publishedAt: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
