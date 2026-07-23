import React from "react";
import { getAllPosts } from "@/lib/mdx";
import TopicsClient from "./topics-client";

export const metadata = {
  title: "Topics | Ansh Varshney",
  description: "Browse articles and notes by technical categories.",
};

export default function Page() {
  const posts = getAllPosts();
  return <TopicsClient initialPosts={posts} />;
}
