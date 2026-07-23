import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ANALYTICS_PATH = path.join(process.cwd(), "content/analytics.json");

function readAnalytics() {
  if (!fs.existsSync(ANALYTICS_PATH)) {
    return { totalViews: 0, viewsBySlug: {}, events: [] };
  }
  const raw = fs.readFileSync(ANALYTICS_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeAnalytics(data: object) {
  fs.writeFileSync(ANALYTICS_PATH, JSON.stringify(data, null, 2));
}

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const data = readAnalytics();
    data.totalViews = (data.totalViews || 0) + 1;
    
    if (!data.viewsBySlug) data.viewsBySlug = {};
    data.viewsBySlug[slug] = (data.viewsBySlug[slug] || 0) + 1;

    if (!data.events) data.events = [];
    data.events.push({
      type: "pageview",
      slug,
      timestamp: new Date().toISOString(),
    });

    // Limit log of raw event history to the last 1000 items
    if (data.events.length > 1000) {
      data.events = data.events.slice(-1000);
    }

    writeAnalytics(data);

    return NextResponse.json({ success: true, total: data.totalViews, views: data.viewsBySlug[slug] });
  } catch {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
