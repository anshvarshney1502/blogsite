"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Home, User, Archive, BookOpen, RefreshCw } from "lucide-react";
import type { Block } from "@/components/admin/page-builder";

const PageBuilder = dynamic(() => import("@/components/admin/page-builder"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-muted gap-2">
      <RefreshCw className="h-5 w-5 animate-spin" />
      <span className="font-mono text-sm">Loading page builder...</span>
    </div>
  ),
});

const PAGES = [
  { slug: "home",    label: "Home Page",    icon: <Home    className="h-4 w-4" />, path: "/" },
  { slug: "about",   label: "About Page",   icon: <User    className="h-4 w-4" />, path: "/about" },
  { slug: "archive", label: "Archive Page", icon: <Archive className="h-4 w-4" />, path: "/archive" },
];

export default function PagesBuilderClient() {
  const [selectedSlug, setSelectedSlug] = useState<string>("home");
  const [initialBlocks, setInitialBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedPage = PAGES.find((p) => p.slug === selectedSlug)!;

  // Load blocks whenever the selected page changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/page-builder/${selectedSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setInitialBlocks(data.blocks ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInitialBlocks([]);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [selectedSlug]);

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Page selector */}
      <div className="flex items-center gap-2 px-6 md:px-8 py-3 border-b border-border bg-background -mx-6 md:-mx-8 mb-0">
        <BookOpen className="h-4 w-4 text-muted shrink-0" />
        <span className="font-mono text-xs text-muted uppercase tracking-wider mr-3">Select Page:</span>
        {PAGES.map((p) => (
          <button
            key={p.slug}
            onClick={() => setSelectedSlug(p.slug)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              selectedSlug === p.slug
                ? "bg-accent/10 border-accent text-accent font-semibold"
                : "border-border text-muted hover:text-foreground hover:bg-muted-light/30"
            }`}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
        <a
          href={selectedPage.path}
          target="_blank"
          className="ml-auto flex items-center gap-1 text-xs font-mono text-muted hover:text-accent transition-colors"
        >
          View Live ↗
        </a>
      </div>

      {/* Builder */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="font-mono text-sm">Loading {selectedPage.label}...</span>
        </div>
      ) : (
        <PageBuilder
          key={selectedSlug}
          pageSlug={selectedSlug}
          pageLabel={selectedPage.label}
          initialBlocks={initialBlocks}
        />
      )}
    </div>
  );
}
