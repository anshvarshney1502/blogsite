"use client";

import React, { useState } from "react";
import Navigation from "@/components/navigation";
import CommandMenu from "@/components/command-menu";
import ArticleCard from "@/components/article-card";
import Link from "next/link";
import { PostMetadata } from "@/lib/mdx";

interface ArticlesClientProps {
  initialPosts: PostMetadata[];
}

export default function ArticlesClient({ initialPosts }: ArticlesClientProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <>
      <Navigation onSearchClick={() => setIsCommandOpen(true)} />
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24 w-full flex-grow">
        {/* Breadcrumb */}
        <nav className="mb-6 font-mono text-[10px] text-muted tracking-wider uppercase">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Articles</span>
        </nav>

        {/* Header Title */}
        <section className="mb-12 border-b border-border/40 pb-8">
          <span className="font-mono text-xs text-accent uppercase tracking-wider block mb-3">EDITIONS INDEX</span>
          <h1 className="font-serif text-3xl md:text-5xl font-semibold leading-tight text-foreground">
            All Publications
          </h1>
          <p className="text-sm text-muted max-w-lg mt-3 leading-relaxed">
            A complete listing of essays, design guides, build logs, and technical writings.
          </p>
        </section>

        {/* Articles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialPosts.map((post) => (
            <ArticleCard key={post.slug} article={post} />
          ))}
        </div>
      </main>

      <footer className="border-t border-border/40 py-8 bg-muted-light/10 mt-12 text-center font-mono text-xs text-muted">
        © {new Date().getFullYear()} Ansh Varshney.
      </footer>
    </>
  );
}
