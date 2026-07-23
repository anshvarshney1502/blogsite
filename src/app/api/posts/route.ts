import { NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/mdx";

export async function GET() {
  const postsMetadata = getAllPosts();
  
  // Fetch full post content for searching body text
  const fullPosts = postsMetadata.map((meta) => {
    const post = getPostBySlug(meta.slug);
    return {
      ...meta,
      content: post ? post.content : "",
    };
  });

  return NextResponse.json(fullPosts);
}
export const dynamic = "force-static";
