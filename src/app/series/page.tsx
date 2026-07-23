import React from "react";
import { getAllPosts } from "@/lib/mdx";
import SeriesClient from "./series-client";

export const metadata = {
  title: "Series | Ansh Varshney",
  description: "Browse articles and logs by sequence series.",
};

export default function Page() {
  const posts = getAllPosts();
  return <SeriesClient initialPosts={posts} />;
}
