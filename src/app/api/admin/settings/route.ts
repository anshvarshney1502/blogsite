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
    return NextResponse.json({ site: db.site, footer: db.currently ? { currently: db.currently, copyright: db.footer.copyright, description: db.footer.description } : db.footer });
  } catch {
    return NextResponse.json({ error: "Failed to read profile data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();

    if (body.site) {
      db.site = { ...db.site, ...body.site };
    }
    if (body.currently !== undefined) {
      db.currently = body.currently;
    }
    if (body.footer) {
      db.footer = { ...db.footer, ...body.footer };
    }

    writeDb(db);
    revalidatePath("/");
    revalidatePath("/about");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update profile configurations" }, { status: 500 });
  }
}
