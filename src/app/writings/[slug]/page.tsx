import React from "react";
import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import ArticleClient from "./article-client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // Cache post content for up to 60 seconds unless explicitly revalidated on-demand

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.metadata.title,
    description: post.metadata.description,
    keywords: post.metadata.tags || [post.metadata.category],
    canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://anshit.com"}/writings/${slug}`,
    type: "article",
    publishedTime: post.metadata.date,
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();

  // Parse outline headings for the dynamic table of contents
  const headings: { id: string; title: string }[] = [];
  const lines = post.content.split("\n");
  lines.forEach((line) => {
    if (line.trim().startsWith("## ")) {
      const title = line.replace("## ", "").trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      headings.push({ id, title });
    }
  });
  
  // Attach parsed headings dynamically to post metadata outline
  post.metadata.outline = headings;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": post.metadata.title,
    "description": post.metadata.description,
    "datePublished": post.metadata.date,
    "dateModified": post.metadata.updated || post.metadata.date,
    "author": {
      "@type": "Person",
      "name": "Ansh Varshney",
      "url": "https://anshit.com/about"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleClient post={post} allPosts={allPosts} />
    </>
  );
}
