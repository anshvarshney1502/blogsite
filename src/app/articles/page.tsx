import React from "react";
import { getAllPosts } from "@/lib/mdx";
import ArticlesClient from "./articles-client";

export const metadata = {
  title: "Publications | Ansh Varshney",
  description: "A complete list of essays, design guides, build logs, and technical writings.",
};

export default function Page() {
  const posts = getAllPosts();
  return <ArticlesClient initialPosts={posts} />;
}
