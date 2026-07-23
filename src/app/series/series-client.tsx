"use client";

import React, { useState } from "react";
import Navigation from "@/components/navigation";
import CommandMenu from "@/components/command-menu";
import ArticleCard from "@/components/article-card";
import Link from "next/link";
import { PostMetadata } from "@/lib/mdx";

interface SeriesClientProps {
  initialPosts: PostMetadata[];
}

export default function SeriesClient({ initialPosts }: SeriesClientProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Extract unique series and counts dynamically
  const seriesCounts: Record<string, number> = {};
  initialPosts.forEach((post) => {
    if (post.series) {
      seriesCounts[post.series] = (seriesCounts[post.series] || 0) + 1;
    }
  });

  const seriesList = Object.entries(seriesCounts).map(([name, count]) => ({
    name,
    count,
  }));

  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);

  const filteredPosts = selectedSeries
    ? initialPosts.filter((post) => post.series === selectedSeries)
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
          <span className="text-foreground">Series</span>
        </nav>

        {/* Header Title */}
        <section className="mb-12 border-b border-border/40 pb-8">
          <span className="font-mono text-xs text-accent uppercase tracking-wider block mb-3">COLLECTIONS DIRECTORY</span>
          <h1 className="font-serif text-3xl md:text-5xl font-semibold leading-tight text-foreground">
            Reading Collections
          </h1>
          <p className="text-sm text-muted max-w-lg mt-3 leading-relaxed">
            Curated linear sequences of writings detailing deep technical logs and systematic build plans.
          </p>
        </section>

        {/* Series Options */}
        <div className="flex flex-wrap gap-2.5 mb-12">
          <button
            onClick={() => setSelectedSeries(null)}
            className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              selectedSeries === null
                ? "bg-foreground text-background border-foreground"
                : "bg-muted-light/30 border-border text-muted hover:text-foreground"
            }`}
          >
            All Collections ({initialPosts.length})
          </button>
          {seriesList.map((s) => (
            <button
              key={s.name}
              onClick={() => setSelectedSeries(s.name)}
              className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                selectedSeries === s.name
                  ? "bg-foreground text-background border-foreground"
                  : "bg-muted-light/30 border-border text-muted hover:text-foreground"
              }`}
            >
              {s.name} ({s.count})
            </button>
          ))}
        </div>

        {/* Selected Series Title & Articles */}
        <div className="space-y-6">
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
            {selectedSeries ? `Sequence: ${selectedSeries}` : "All Sequences"}
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
