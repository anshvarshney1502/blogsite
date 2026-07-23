import { NextResponse } from "next/server";
import { getBlogs, createBlog } from "@/lib/db-adapter";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const posts = await getBlogs();
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, slug, category } = await request.json();
    const targetSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const result = await createBlog({ title, slug: targetSlug, categoryName: category });

    // Revalidate lists
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/archive");

    return NextResponse.json({ success: true, slug: targetSlug, data: result });
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
