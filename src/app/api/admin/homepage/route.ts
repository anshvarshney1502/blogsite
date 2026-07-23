import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const DB_PATH = path.join(process.cwd(), "content/db.json");

function readDb() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data: object) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json({ sections: db.homepage_sections || [] });
  } catch {
    return NextResponse.json({ error: "Failed to read homepage data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { sections } = await request.json();
    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Invalid sections data" }, { status: 400 });
    }

    const db = readDb();
    db.homepage_sections = sections;
    writeDb(db);

    // Revalidate index page instantly
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to write homepage data" }, { status: 500 });
  }
}
