"use client";

import React, { useState } from "react";
import Navigation from "@/components/navigation";
import CommandMenu from "@/components/command-menu";
import ArticleCard from "@/components/article-card";
import Link from "next/link";
import { PostMetadata } from "@/lib/mdx";

interface TopicsClientProps {
  initialPosts: PostMetadata[];
}

export default function TopicsClient({ initialPosts }: TopicsClientProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Extract unique topics and counts dynamically
  const topicCounts: Record<string, number> = {};
  initialPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      topicCounts[tag] = (topicCounts[tag] || 0) + 1;
    });
  });

  const topics = Object.entries(topicCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredPosts = selectedTopic
    ? initialPosts.filter((post) => post.tags.includes(selectedTopic))
    : initialPosts;

  return (
    <>
      <Navigation onSearchClick={() => setIsCommandOpen(true)} />
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24 w-full flex-grow">
        {/* Breadcrumb */}
        <nav className="mb-6 font-mono text-[10px] text-muted tracking-wider uppercase">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Topics</span>
        </nav>

        {/* Header Title */}
        <section className="mb-12 border-b border-border/40 pb-8">
          <span className="font-mono text-xs text-accent uppercase tracking-wider block mb-3">TAXONOMY REGISTER</span>
          <h1 className="font-serif text-3xl md:text-5xl font-semibold leading-tight text-foreground">
            Explore by Topic
          </h1>
          <p className="text-sm text-muted max-w-lg mt-3 leading-relaxed">
            Select a metadata tag to filter technical notes and publications.
          </p>
        </section>

        {/* Topics Pills */}
        <div className="flex flex-wrap gap-2.5 mb-12">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              selectedTopic === null
                ? "bg-foreground text-background border-foreground"
                : "bg-muted-light/30 border-border text-muted hover:text-foreground"
            }`}
          >
            All Topics ({initialPosts.length})
          </button>
          {topics.map((t) => (
            <button
              key={t.name}
              onClick={() => setSelectedTopic(t.name)}
              className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                selectedTopic === t.name
                  ? "bg-foreground text-background border-foreground"
                  : "bg-muted-light/30 border-border text-muted hover:text-foreground"
              }`}
            >
              {t.name} ({t.count})
            </button>
          ))}
        </div>

        {/* Selected Topic Title & Articles */}
        <div className="space-y-6">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
            {selectedTopic ? `Writings Tagged: ${selectedTopic}` : "All Writings"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <ArticleCard key={post.slug} article={post} />
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 py-8 bg-muted-light/10 mt-12 text-center font-mono text-xs text-muted">
        © {new Date().getFullYear()} Ansh Varshney.
      </footer>
    </>
  );
}
