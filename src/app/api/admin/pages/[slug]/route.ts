/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/admin/pages/[slug]/route.ts
import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const PAGES_DIR = path.join(process.cwd(), "content/pages");

if (!fs.existsSync(PAGES_DIR)) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const filePath = path.join(PAGES_DIR, `${slug}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ sections: [] });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await request.json();
    const filePath = path.join(PAGES_DIR, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
    revalidatePath(`/${slug}`);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
