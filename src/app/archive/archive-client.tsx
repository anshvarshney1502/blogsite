"use client";

import React, { useState, useMemo } from "react";
import Navigation from "@/components/navigation";
import CommandMenu from "@/components/command-menu";
import Link from "next/link";
import { ArrowUpRight, Calendar, Bookmark, FolderOpen, Clock, BarChart2 } from "lucide-react";
import { PostMetadata } from "@/lib/mdx";

interface ArchiveClientProps {
  posts: PostMetadata[];
}

export default function ArchiveClient({ posts }: ArchiveClientProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedSeries, setSelectedSeries] = useState<string>("all");
  const [selectedReadingTime, setSelectedReadingTime] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "views">("newest");

  // Dynamically derive filter options from posts
  const years = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      const year = new Date(p.date).getFullYear().toString();
      set.add(year);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [posts]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      p.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [posts]);

  const seriesList = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.series) set.add(p.series);
    });
    return Array.from(set).sort();
  }, [posts]);

  // Filter and Sort implementation
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // Filter Year
    if (selectedYear !== "all") {
      result = result.filter(
        (p) => new Date(p.date).getFullYear().toString() === selectedYear
      );
    }

    // Filter Topic
    if (selectedTopic !== "all") {
      result = result.filter((p) => p.tags.includes(selectedTopic));
    }

    // Filter Series
    if (selectedSeries !== "all") {
      result = result.filter((p) => p.series === selectedSeries);
    }

    // Filter Reading Time
    if (selectedReadingTime !== "all") {
      result = result.filter((p) => {
        const mins = parseInt(p.readingTime);
        if (selectedReadingTime === "short") return mins <= 10;
        if (selectedReadingTime === "long") return mins > 10;
        return true;
      });
    }

    // Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === "views") {
      // Mock views fallback
      const getViews = (p: PostMetadata) => {
        if (p.slug === "distributed-consensus") return 2450;
        if (p.slug === "interfaces-for-ai") return 1820;
        return 500;
      };
      result.sort((a, b) => getViews(b) - getViews(a));
    }

    return result;
  }, [posts, selectedYear, selectedTopic, selectedSeries, selectedReadingTime, sortBy]);

  // Group by year for display
  const groupedPosts = useMemo(() => {
    const groups: Record<string, PostMetadata[]> = {};
    filteredAndSortedPosts.forEach((post) => {
      const year = new Date(post.date).getFullYear().toString();
      if (!groups[year]) groups[year] = [];
      groups[year].push(post);
    });
    return groups;
  }, [filteredAndSortedPosts]);

  return (
    <>
      <Navigation onSearchClick={() => setIsCommandOpen(true)} />
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24 w-full flex-grow">
        
        {/* Header Title */}
        <section className="mb-12 border-b border-border/40 pb-8">
          <span className="font-mono text-xs text-accent uppercase tracking-wider block mb-3">CHRONOLOGICAL INDEX</span>
          <h1 className="font-serif text-3xl md:text-5xl font-semibold leading-tight text-foreground">
            The Publication Archive
          </h1>
          <p className="text-sm text-muted max-w-lg mt-3 leading-relaxed">
            A comprehensive, filterable index of all digital writing. Designed for navigating knowledge structures.
          </p>
        </section>

        {/* Filters Controls Panel */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-5 rounded-xl border border-border bg-muted-light/10 mb-12">
          
          {/* Year Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted flex items-center gap-1">
              <Calendar className="h-3 w-3" /> YEAR
            </span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-background border border-border/60 hover:border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none font-mono"
            >
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Topic/Tag Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted flex items-center gap-1">
              <Bookmark className="h-3 w-3" /> TOPIC
            </span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-background border border-border/60 hover:border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none font-mono"
            >
              <option value="all">All Topics</option>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Series Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted flex items-center gap-1">
              <FolderOpen className="h-3 w-3" /> SERIES
            </span>
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="w-full bg-background border border-border/60 hover:border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none font-mono"
            >
              <option value="all">All Series</option>
              {seriesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Reading Time Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted flex items-center gap-1">
              <Clock className="h-3 w-3" /> LENGTH
            </span>
            <select
              value={selectedReadingTime}
              onChange={(e) => setSelectedReadingTime(e.target.value)}
              className="w-full bg-background border border-border/60 hover:border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none font-mono"
            >
              <option value="all">All Lengths</option>
              <option value="short">Short (≤ 10 mins)</option>
              <option value="long">Long (&gt; 10 mins)</option>
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] text-muted flex items-center gap-1">
              <BarChart2 className="h-3 w-3" /> SORT BY
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "views")}
              className="w-full bg-background border border-border/60 hover:border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none font-mono"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="views">Most read</option>
            </select>
          </div>

        </section>

        {/* Archive List Grouped by Year */}
        <section className="flex flex-col gap-12">
          {Object.keys(groupedPosts).length === 0 ? (
            <div className="py-24 text-center font-mono text-xs text-muted border border-dashed border-border/80 rounded-xl">
              No index matches found. Adjust filter tags.
            </div>
          ) : (
            Object.keys(groupedPosts)
              .sort((a, b) => b.localeCompare(a))
              .map((year) => (
                <div key={year} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start border-t border-border/20 pt-8">
                  {/* Left Column Year Heading */}
                  <div className="md:col-span-1">
                    <span className="font-serif text-3xl md:text-4xl font-light italic text-muted-light dark:text-muted/40 select-none block">
                      {year}
                    </span>
                    <span className="font-mono text-[10px] text-muted block mt-1">
                      {groupedPosts[year].length} edition{groupedPosts[year].length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Right Column Posts lists */}
                  <div className="md:col-span-3 flex flex-col gap-6">
                    {groupedPosts[year].map((post) => (
                      <Link key={post.slug} href={`/writings/${post.slug}`} className="group block">
                        <div className="flex justify-between items-start gap-4 p-4 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted-light/10 transition-all duration-300">
                          <div>
                            <span className="text-[9px] font-mono text-muted uppercase tracking-wider block mb-1">
                              {post.tags?.[0]} {post.series && `• ${post.series}`}
                            </span>
                            <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-accent transition-colors flex items-center gap-1">
                              <span>{post.title}</span>
                              <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-accent shrink-0" />
                            </h3>
                            <p className="text-xs text-muted mt-2 leading-relaxed line-clamp-2">
                              {post.description}
                            </p>
                          </div>

                          <div className="font-mono text-[10px] text-muted shrink-0 text-right self-center flex flex-col gap-0.5">
                            <div>{post.readingTime}</div>
                            <div>{post.date}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
          )}
        </section>

      </main>

      <footer className="border-t border-border/40 py-8 bg-muted-light/10">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-muted">
          <div>© {new Date().getFullYear()} Ansh Varshney Archive.</div>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-foreground">Home Journal</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-foreground">About & CV</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
