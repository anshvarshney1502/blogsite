import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public/uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const hasCloudinary =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

// Runtime require — avoids TypeScript/Webpack static analysis
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadCloudinary(): any | null {
  if (!hasCloudinary) return null;
  try {
    // Use Function constructor to bypass static analysis
    const requireFn = new Function("m", "return require(m)");
    const cld = requireFn("cloudinary");
    cld.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return cld.v2;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const cld = loadCloudinary();
    if (cld) {
      const result = await cld.api.resources({ type: "upload", prefix: "blog/", max_results: 200 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json({ source: "cloudinary", files: result.resources.map((r: any) => ({
        id: r.public_id, url: r.secure_url, name: r.public_id.split("/").pop() || r.public_id,
        size: r.bytes, format: r.format, width: r.width, height: r.height, createdAt: r.created_at,
      })) });
    }

    const files = fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR) : [];
    const fileList = files
      .filter((f) => /\.(jpg|jpeg|png|gif|webp|svg|mp4|pdf)$/i.test(f))
      .map((f) => {
        const stat = fs.statSync(path.join(UPLOADS_DIR, f));
        return { id: f, url: `/uploads/${f}`, name: f, size: stat.size, format: f.split(".").pop() || "", createdAt: stat.birthtime.toISOString() };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ source: "local", files: fileList });
  } catch {
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Restrict file size to 10MB maximum
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    // MIME type checking (only allow safe images, videos, and PDFs)
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/avif",
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Verify file extension matched mapping rules
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|svg|avif|mp4|mov|webm|pdf)$/i;
    if (!allowedExtensions.test(file.name)) {
      return NextResponse.json({ error: "Invalid file extension" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, "_");
    const fileName = `${Date.now()}_${safeName}`;

    const cld = loadCloudinary();
    if (cld) {
      const tempPath = path.join(UPLOADS_DIR, `temp_${fileName}`);
      fs.writeFileSync(tempPath, buffer);
      const result = await cld.uploader.upload(tempPath, { folder: "blog", use_filename: true });
      fs.unlinkSync(tempPath);
      return NextResponse.json({ source: "cloudinary", url: result.secure_url, publicId: result.public_id, size: result.bytes, format: result.format });
    }

    // Fail-safe check in production to ensure local uploads are not used
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Cloudinary configuration is required in production" }, { status: 500 });
    }

    const filePath = path.join(UPLOADS_DIR, fileName);
    fs.writeFileSync(filePath, buffer);
    return NextResponse.json({ source: "local", url: `/uploads/${fileName}`, name: fileName, size: buffer.length });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "No id provided" }, { status: 400 });

    const cld = loadCloudinary();
    if (cld) {
      await cld.uploader.destroy(id);
      return NextResponse.json({ success: true });
    }

    const filePath = path.join(UPLOADS_DIR, id);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
