import React from "react";
import { getAllPosts } from "@/lib/mdx";
import { getDb } from "@/lib/db";
import HomeClient from "./home-client";

export const revalidate = 60; // Max caching time of 60 seconds unless programmatically revalidated

export async function generateMetadata() {
  const db = getDb();
  return {
    title: db.site.seoTitle,
    description: db.site.seoDescription,
  };
}

export default async function HomePage() {
  const posts = getAllPosts();
  const db = getDb();
  return <HomeClient initialPosts={posts} db={db} />;
}
