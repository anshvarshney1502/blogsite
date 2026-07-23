import { NextResponse } from "next/server";
import { getBlog, updateBlog, deleteBlog } from "@/lib/db-adapter";
import { revalidatePath } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getBlog(slug);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      metadata: {
        title: post.title,
        description: post.description,
        date: post.date,
        category: post.category,
        tags: post.tags,
        draft: post.draft,
        featured: post.featured,
        archived: post.archived,
        readingTime: post.readingTime,
        slug: post.slug,
        publishedAt: post.publishedAt
      },
      content: post.content,
    });
  } catch {
    return NextResponse.json({ error: "Failed to read post" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { metadata, content } = await request.json();

    const result = await updateBlog(slug, {
      title: metadata.title,
      description: metadata.description,
      content,
      cover: metadata.cover,
      draft: metadata.draft,
      featured: metadata.featured,
      archived: metadata.archived,
      publishedAt: metadata.publishedAt,
      category: metadata.category,
      tags: metadata.tags
    });

    // Revalidate paths for instant updates
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/archive");
    revalidatePath(`/writings/${slug}`);

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await deleteBlog(slug);

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/archive");
    revalidatePath(`/writings/${slug}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
