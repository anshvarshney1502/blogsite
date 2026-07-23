import React from "react";
import { getAllPosts } from "@/lib/mdx";
import ArchiveClient from "./archive-client";

export const metadata = {
  title: "Archive | Ansh Varshney",
  description: "A chronological list of all articles, essays, and notes on Artificial Intelligence, Python, Machine Learning, and Software Engineering.",
};

export default async function ArchivePage() {
  const posts = getAllPosts();
  return <ArchiveClient posts={posts} />;
}
