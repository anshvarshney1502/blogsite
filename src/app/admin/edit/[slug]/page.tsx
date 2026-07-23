import React from "react";
import { getBlog } from "@/lib/db-adapter";
import EditClient from "./edit-client";

export const metadata = {
  title: "CMS Article Editor",
  description: "Dynamic markdown configuration panels."
};

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { slug } = await params;
  const post = await getBlog(slug);

  if (!post) {
    return (
      <div className="p-8 text-center font-mono text-xs text-muted">
        Article not found in database or local disk.
      </div>
    );
  }

  const mappedPost = {
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
    content: post.content
  };

  return <EditClient initialPost={mappedPost} />;
}
