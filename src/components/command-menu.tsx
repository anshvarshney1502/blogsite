"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Terminal, FileText, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface SearchPost {
  title: string;
  description: string;
  category: string;
  tags: string[];
  slug: string;
  content: string;
  readingTime: string;
  date: string;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  type: "Writings" | "Actions";
  path?: string;
  action?: () => void;
  tags?: string[];
}

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch full index once
  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const shortcuts = React.useMemo(() => [
    {
      id: "cmd-mode",
      title: "Toggle Color Scheme",
      subtitle: "Switch between light and dark modes",
      type: "Actions" as const,
      action: () => {
        const isDark = document.documentElement.classList.contains("dark");
        if (isDark) {
          document.documentElement.classList.remove("dark");
          localStorage.theme = "light";
        } else {
          document.documentElement.classList.add("dark");
          localStorage.theme = "dark";
        }
        onClose();
      }
    },
    {
      id: "cmd-about",
      title: "View Profile & CV",
      subtitle: "Read professional timeline",
      type: "Actions" as const,
      action: () => {
        router.push("/about");
        onClose();
      }
    }
  ], [onClose, router]);

  // Comprehensive instant search (matches titles, description, tags, content)
  const filteredItems = React.useMemo<CommandItem[]>(() => {
    const queryLower = query.toLowerCase().trim();
    if (!queryLower) {
      // Default dashboard state
      return [
        ...posts.map(p => ({
          id: p.slug,
          title: p.title,
          subtitle: p.description,
          type: "Writings" as const,
          path: `/writings/${p.slug}`,
          tags: p.tags,
        })),
        ...shortcuts.map(s => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          type: "Actions" as const,
          action: s.action,
        }))
      ];
    }

    const matchedPosts = posts
      .filter((p) => {
        return (
          p.title.toLowerCase().includes(queryLower) ||
          p.description.toLowerCase().includes(queryLower) ||
          p.tags.some((t) => t.toLowerCase().includes(queryLower)) ||
          p.content.toLowerCase().includes(queryLower)
        );
      })
      .map((p) => ({
        id: p.slug,
        title: p.title,
        subtitle: p.description,
        type: "Writings" as const,
        path: `/writings/${p.slug}`,
        tags: p.tags,
      }));

    const matchedShortcuts = shortcuts.filter(
      (s) =>
        s.title.toLowerCase().includes(queryLower) ||
        s.subtitle.toLowerCase().includes(queryLower)
    );

    return [...matchedPosts, ...matchedShortcuts];
  }, [query, posts, shortcuts]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          if (selected.action) {
            selected.action();
          } else if (selected.path) {
            router.push(selected.path);
            onClose();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose, router]);

  // Linear-style highlighted match rendering
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-accent/20 text-accent font-semibold rounded px-0.5 select-none">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-background shadow-2xl mx-4"
          >
            {/* Search Input */}
            <div className="flex items-center border-b border-border/80 px-4 py-3.5">
              <Search className="mr-3 h-4.5 w-4.5 text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type to search index, articles, and actions..."
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-sm text-foreground placeholder-muted outline-none border-none focus:ring-0"
              />
              <button
                onClick={onClose}
                className="text-[10px] bg-muted-light border border-border px-1.5 py-0.5 rounded font-mono text-muted cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Suggestions & Results List */}
            <div className="max-h-[340px] overflow-y-auto p-2">
              {loading ? (
                <div className="py-12 text-center font-mono text-xs text-muted">Indexing Database...</div>
              ) : filteredItems.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center text-muted">
                  <AlertCircle className="h-6 w-6 mb-2 text-muted/60" />
                  <span className="text-sm">No results found for &ldquo;{query}&rdquo;</span>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else if (item.path) {
                          router.push(item.path);
                          onClose();
                        }
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group flex items-start justify-between px-3 py-3 rounded-lg text-sm transition-colors cursor-pointer ${
                        isSelected ? "bg-muted-light text-foreground" : "text-muted hover:text-foreground"
                      }`}
                    >
                      <div className="flex gap-3">
                        {item.type === "Actions" ? (
                          <Terminal className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
                        ) : (
                          <FileText className="h-4.5 w-4.5 text-muted group-hover:text-foreground shrink-0 mt-0.5" />
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground">
                            {highlightText(item.title, query)}
                          </span>
                          {item.subtitle && (
                            <span className="text-xs text-muted max-w-[400px] line-clamp-1">
                              {highlightText(item.subtitle, query)}
                            </span>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              {item.tags.map(tag => (
                                <span key={tag} className="text-[9px] font-mono bg-background border border-border px-1.5 py-0.5 rounded text-muted">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-center shrink-0">
                        <span className="text-[9px] opacity-60 uppercase font-mono px-1.5 py-0.5 bg-background border border-border rounded">
                          {item.type}
                        </span>
                        {isSelected && <ArrowRight className="h-3.5 w-3.5 text-accent" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/80 px-4 py-2.5 bg-muted-light/30 text-[10px] font-mono text-muted">
              <div className="flex gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <span>Ansh Varshney Search v1.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
