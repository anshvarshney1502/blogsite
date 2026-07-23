"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import CommandMenu from "@/components/command-menu";
import { ArrowLeft, Check, ChevronRight, Share2, Sparkles, Bookmark, Eye, BookmarkCheck, Flame, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { PostMetadata, Post } from "@/lib/mdx";
import { MDXContentRenderer } from "@/components/mdx-components";

interface ArticleClientProps {
  post: Post;
  allPosts: PostMetadata[];
}

export default function ArticleClient({ post, allPosts }: ArticleClientProps) {
  const router = useRouter();
  
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "larger">("normal");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");

  // Unique personal features
  const [isZenMode, setIsZenMode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingStreak, setReadingStreak] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  const { slug } = post.metadata;

  // Sync scroll & progress
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }

      // Check current section
      if (post.metadata.outline) {
        const sections = post.metadata.outline.map(o => document.getElementById(o.id));
        const scrollPosition = window.scrollY + 120;

        for (let i = sections.length - 1; i >= 0; i--) {
          const sec = sections[i];
          if (sec && sec.offsetTop <= scrollPosition) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

  // Sync unique states with localStorage
  useEffect(() => {
    // Bookmarks check
    const bookmarks = JSON.parse(localStorage.getItem("ledger_bookmarks") || "[]");
    setIsBookmarked(bookmarks.includes(slug));

    // History log
    const history = JSON.parse(localStorage.getItem("ledger_history") || "[]");
    if (!history.includes(slug)) {
      const updatedHistory = [slug, ...history].slice(0, 10);
      localStorage.setItem("ledger_history", JSON.stringify(updatedHistory));
      setHistoryCount(updatedHistory.length);
    } else {
      setHistoryCount(history.length);
    }

    // Trigger local API route pageview count increment
    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});

    // Reading streak
    const today = new Date().toDateString();
    const lastRead = localStorage.getItem("ledger_last_read");
    let currentStreak = parseInt(localStorage.getItem("ledger_streak") || "0");

    if (lastRead !== today) {
      if (lastRead === new Date(Date.now() - 86400000).toDateString()) {
        currentStreak += 1;
      } else if (!lastRead) {
        currentStreak = 1;
      } else {
        currentStreak = 1; // Reset if break day
      }
      localStorage.setItem("ledger_streak", currentStreak.toString());
      localStorage.setItem("ledger_last_read", today);
    }
    setReadingStreak(currentStreak);
  }, [slug]);

  // Toggle Bookmark handler
  const handleBookmarkToggle = () => {
    const bookmarks = JSON.parse(localStorage.getItem("ledger_bookmarks") || "[]");
    let nextBookmarks;
    if (bookmarks.includes(slug)) {
      nextBookmarks = bookmarks.filter((b: string) => b !== slug);
      setIsBookmarked(false);
    } else {
      nextBookmarks = [...bookmarks, slug];
      setIsBookmarked(true);
    }
    localStorage.setItem("ledger_bookmarks", JSON.stringify(nextBookmarks));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommandOpen || document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "ArrowLeft") {
        router.push("/");
      } else if (e.key === "Escape") {
        if (isZenMode) {
          setIsZenMode(false);
        } else {
          router.push("/");
        }
      } else if (e.key === "z" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsZenMode(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandOpen, isZenMode, router]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const prevPost = currentIndex < allPosts.length - 1 && currentIndex !== -1 ? allPosts[currentIndex + 1] : null;

  return (
    <>
      {/* Conditionally hide navigation in Zen Focus Mode */}
      {!isZenMode && <Navigation onSearchClick={() => setIsCommandOpen(true)} scrollProgress={scrollProgress} />}
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Exit Zen instructions */}
      {isZenMode && (
        <div className="fixed top-6 left-6 z-50 text-[10px] font-mono text-muted no-print flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-lg shadow-sm">
          <span>Focus Mode active</span>
          <span className="text-border">|</span>
          <button
            onClick={() => setIsZenMode(false)}
            className="text-foreground hover:underline cursor-pointer"
          >
            Exit (Esc)
          </button>
        </div>
      )}

      <div className={`mx-auto max-w-5xl px-6 py-12 md:py-20 w-full flex-grow transition-all duration-500 ${isZenMode ? "mt-8" : ""}`}>
        {/* Back navigation & settings */}
        <div className={`flex justify-between items-center mb-12 border-b border-border/20 pb-4 no-print ${isZenMode ? "opacity-0 h-0 overflow-hidden mb-0 pb-0" : ""}`}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Journal</span>
            <kbd className="hidden sm:inline-block ml-2 text-[9px] bg-muted-light border border-border px-1 rounded">ESC</kbd>
          </Link>

          {/* Share & Preferences & Bookmarks */}
          <div className="flex items-center gap-4">
            {/* Gamification stats */}
            <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-border">
              <span className="flex items-center gap-1 font-mono text-[10px] text-muted" title="Daily Reading Streak">
                <Flame className="h-3.5 w-3.5 text-orange-500 animate-pulse" /> {readingStreak}d Streak
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-muted" title="Articles Read History">
                <Eye className="h-3.5 w-3.5" /> {historyCount} read
              </span>
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleBookmarkToggle}
              className="flex items-center gap-1 text-xs font-mono text-muted hover:text-foreground cursor-pointer transition-colors"
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Essay"}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5 text-accent" />
                  <span className="text-accent font-semibold">Bookmarked</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Bookmark</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-foreground cursor-pointer transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copied ? "Link Copied" : "Share"}</span>
            </button>

            <div className="h-3 w-[1px] bg-border/60" />
            
            <button
              onClick={() => setIsZenMode(true)}
              className="text-[10px] font-mono text-muted hover:text-foreground cursor-pointer px-1.5 py-0.5 border border-border rounded flex items-center gap-1"
              title="Zen Focus Mode (Cmd+Z)"
            >
              <BookOpen className="h-3 w-3" /> Focus
            </button>
            
            <div className="flex gap-1.5">
              <button
                onClick={() => setFontFamily(fontFamily === "serif" ? "sans" : "serif")}
                className="text-[10px] font-mono text-muted hover:text-foreground cursor-pointer px-1.5 py-0.5 border border-border rounded"
              >
                {fontFamily === "serif" ? "Sans" : "Serif"}
              </button>
              <button
                onClick={() => {
                  if (fontSize === "normal") setFontSize("large");
                  else if (fontSize === "large") setFontSize("larger");
                  else setFontSize("normal");
                }}
                className="text-[10px] font-mono text-muted hover:text-foreground cursor-pointer px-1.5 py-0.5 border border-border rounded"
              >
                Text+
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Header */}
        <header className="max-w-[720px] mx-auto mb-12">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted mb-6">
            <span className="uppercase text-accent font-semibold">{post.metadata.category}</span>
            {post.metadata.series && (
              <>
                <span>•</span>
                <span className="italic">{post.metadata.series}</span>
              </>
            )}
            <span>•</span>
            <span>{post.metadata.readingTime}</span>
          </div>
          <h1 className="font-serif text-3.5xl md:text-5xl font-semibold leading-[1.15] tracking-tight text-foreground mb-8">
            {post.metadata.title}
          </h1>

          {/* Author Block, Published Date, Updated Date */}
          <div className={`flex items-center justify-between border-t border-b border-border/30 py-6 my-8 ${isZenMode ? "no-print" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-border flex items-center justify-center text-xs font-mono font-semibold text-accent">
                AV
              </div>
              <div>
                <span className="text-xs font-mono text-foreground font-semibold block">Ansh Varshney</span>
                <span className="text-[10px] font-mono text-muted">ML Engineer</span>
              </div>
            </div>
            <div className="text-right font-mono text-[10px] text-muted flex flex-col gap-0.5">
              <div>Published: <span className="text-foreground">{post.metadata.date}</span></div>
              {post.metadata.updated && (
                <div>Updated: <span className="text-foreground">{post.metadata.updated}</span></div>
              )}
            </div>
          </div>
        </header>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          
          {/* Main Article Content (Centered and constrained to 720px) */}
          <div className={`lg:col-span-3 lg:max-w-[720px] mx-auto transition-all ${isZenMode ? "lg:col-span-4 max-w-[720px]" : ""}`}>
            
            {/* MDX Body Renderer */}
            <div
              className={`prose dark:prose-invert max-w-none transition-all duration-200 ${
                fontFamily === "serif" ? "font-serif" : "font-sans"
              } ${
                fontSize === "normal" ? "text-base md:text-lg" : fontSize === "large" ? "text-lg md:text-xl" : "text-xl md:text-2xl"
              }`}
            >
              <MDXContentRenderer content={post.content} />
            </div>

            {/* Tags section */}
            <div className="mt-12 pt-6 border-t border-border/20 flex flex-wrap gap-2 no-print">
              {post.metadata.tags.map(tag => (
                <span key={tag} className="text-[10px] font-mono bg-muted-light text-muted px-2.5 py-1 border border-border/80 rounded">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Previous & Next Article Cards */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-border/30 no-print ${isZenMode ? "hidden" : ""}`}>
              {prevPost ? (
                <Link href={`/writings/${prevPost.slug}`} className="group flex flex-col justify-between p-5 rounded-lg border border-border/60 hover:border-border bg-background hover:bg-muted-light/10 transition-colors">
                  <span className="font-mono text-[10px] text-muted block mb-2">PREVIOUS ESSAY</span>
                  <span className="font-serif text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {prevPost.title}
                  </span>
                </Link>
              ) : (
                <div className="p-5 rounded-lg border border-border/20 bg-muted-light/5 text-[10px] font-mono text-muted flex items-center justify-center">
                  First publication edition
                </div>
              )}

              {nextPost ? (
                <Link href={`/writings/${nextPost.slug}`} className="group flex flex-col justify-between p-5 rounded-lg border border-border/60 hover:border-border bg-background hover:bg-muted-light/10 transition-colors text-right">
                  <span className="font-mono text-[10px] text-muted block mb-2">NEXT ESSAY</span>
                  <span className="font-serif text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {nextPost.title}
                  </span>
                </Link>
              ) : (
                <div className="p-5 rounded-lg border border-border/20 bg-muted-light/5 text-[10px] font-mono text-muted flex items-center justify-center">
                  Latest publication edition
                </div>
              )}
            </div>

          </div>

          {/* Sticky sidebar Table of Contents (only on desktop and when not in Zen Mode) */}
          {post.metadata.outline && post.metadata.outline.length > 0 && !isZenMode && (
            <aside className="hidden lg:block lg:col-span-1 no-print">
              <div className="sticky top-28 flex flex-col gap-6 pl-4 border-l border-border/60">
                <div>
                  <h4 className="font-mono text-[10px] tracking-widest text-muted uppercase font-semibold mb-4">TABLE OF CONTENTS</h4>
                  <nav className="flex flex-col gap-3 font-mono text-[11px]">
                    {post.metadata.outline.map((o) => (
                      <a
                        key={o.id}
                        href={`#${o.id}`}
                        className={`flex items-center gap-1.5 transition-colors group ${
                          activeSection === o.id ? "text-accent font-semibold" : "text-muted hover:text-foreground"
                        }`}
                      >
                        <ChevronRight className={`h-3.5 w-3.5 text-accent shrink-0 ${activeSection === o.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}`} />
                        <span className="truncate">{o.title}</span>
                      </a>
                    ))}
                  </nav>
                </div>

                <div className="p-4 rounded-lg border border-border/40 bg-muted-light/10 font-mono text-[9px] text-muted leading-relaxed">
                  <div className="flex items-center gap-1 text-foreground font-semibold mb-2">
                    <Sparkles className="h-3 w-3 text-accent" />
                    <span>KEYBOARD NAV</span>
                  </div>
                  Use <kbd className="bg-background border border-border px-1 rounded">←</kbd> and <kbd className="bg-background border border-border px-1 rounded">→</kbd> keys to cycle through publications. Press <kbd className="bg-background border border-border px-1 rounded">ESC</kbd> to return to index.
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </>
  );
}
