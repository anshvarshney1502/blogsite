import React from "react";
import { getBlogs } from "@/lib/db-adapter";
import AdminClient from "./admin-client";

export const metadata = {
  title: "Admin Dashboard Control Center",
  description: "Dynamic configuration and publication oversight."
};

export default async function AdminDashboardPage() {
  const posts = await getBlogs();
  // Ensure the PostMetadata interface keys match exactly
  const mappedPosts = posts.map(p => ({
    title: p.title,
    description: p.description,
    date: p.date,
    updated: p.publishedAt || p.date,
    cover: p.coverImage || "/images/placeholder.jpg",
    category: p.category,
    tags: p.tags,
    draft: p.draft,
    featured: p.featured,
    archived: p.archived,
    readingTime: p.readingTime,
    slug: p.slug
  }));

  return <AdminClient initialPosts={mappedPosts} />;
}
