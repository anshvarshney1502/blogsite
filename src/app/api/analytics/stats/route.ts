import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ANALYTICS_PATH = path.join(process.cwd(), "content/analytics.json");

export async function GET() {
  try {
    if (!fs.existsSync(ANALYTICS_PATH)) {
      return NextResponse.json({ totalViews: 0, viewsBySlug: {}, events: [] });
    }
    const raw = fs.readFileSync(ANALYTICS_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to read analytics data" }, { status: 500 });
  }
}
