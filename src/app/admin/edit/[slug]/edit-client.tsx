"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Cloud } from "lucide-react";
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(() => import("@/components/admin/tiptap-editor"), { ssr: false });

interface PostData {
  metadata: {
    title: string;
    description: string;
    date: string;
    category: string;
    tags: string[];
    draft: boolean;
    featured: boolean;
    archived: boolean;
    publishedAt: string | null;
    readingTime: string;
    slug: string;
  };
  content: string;
}

interface EditClientProps {
  initialPost: PostData;
}

export default function EditClient({ initialPost }: EditClientProps) {
  const router = useRouter();

  // Content states
  const [title, setTitle] = useState(initialPost.metadata.title);
  const [description, setDescription] = useState(initialPost.metadata.description);
  const [category, setCategory] = useState(initialPost.metadata.category);
  const [draft, setDraft] = useState(initialPost.metadata.draft);
  const [featured, setFeatured] = useState(initialPost.metadata.featured);
  const [archived, setArchived] = useState(initialPost.metadata.archived || false);
  const [publishedAt, setPublishedAt] = useState(initialPost.metadata.publishedAt || "");
  const [content, setContent] = useState(initialPost.content);

  // Status states
  const [saving, setSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Save handler
  const handleSave = useCallback(async (isAutosave = false) => {
    if (!isAutosave) {
      setSaving(true);
    } else {
      setAutosaveStatus("saving");
    }

    try {
      const updatedPost = {
        metadata: {
          ...initialPost.metadata,
          title,
          description,
          category,
          draft,
          featured,
          archived,
          publishedAt: publishedAt || null,
        },
        content,
      };

      const res = await fetch(`/api/admin/posts/${initialPost.metadata.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });

      if (res.ok) {
        if (!isAutosave) {
          setSaving(false);
        } else {
          setAutosaveStatus("saved");
          setTimeout(() => setAutosaveStatus("idle"), 2000);
        }
      } else {
        if (!isAutosave) {
          setSaving(false);
          alert("Failed to save.");
        } else {
          setAutosaveStatus("error");
        }
      }
    } catch {
      if (!isAutosave) {
        setSaving(false);
        alert("Server connection failed.");
      } else {
        setAutosaveStatus("error");
      }
    }
  }, [title, description, category, draft, featured, archived, publishedAt, content, initialPost]);

  // Autosave debounce (3s)
  useEffect(() => {
    if (
      title === initialPost.metadata.title &&
      description === initialPost.metadata.description &&
      category === initialPost.metadata.category &&
      draft === initialPost.metadata.draft &&
      featured === initialPost.metadata.featured &&
      archived === (initialPost.metadata.archived || false) &&
      publishedAt === (initialPost.metadata.publishedAt || "") &&
      content === initialPost.content
    ) {
      return;
    }

    const timer = setTimeout(() => {
      handleSave(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, description, category, draft, featured, archived, publishedAt, content, initialPost, handleSave]);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="p-2 hover:text-foreground text-muted border border-border rounded-lg bg-background hover:bg-muted-light/40 transition-colors cursor-pointer active-tactile"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="font-mono text-[9px] text-muted uppercase tracking-wider block">Rich Editor</span>
            <h1 className="font-serif text-xl font-semibold text-foreground leading-tight line-clamp-1">{title || "Untitled"}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto font-mono text-xs">
          <div className="flex items-center gap-1.5 text-muted mr-2">
            <Cloud className="h-4 w-4" />
            <span>
              {autosaveStatus === "saving" && "Autosaving..."}
              {autosaveStatus === "saved" && "Autosaved ✓"}
              {autosaveStatus === "error" && "Save failed"}
              {autosaveStatus === "idle" && "All changes saved"}
            </span>
          </div>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50 active-tactile"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save Now"}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Metadata sidebar + TipTap editor */}
      <div className="flex-grow grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        {/* Left: Metadata Sidebar */}
        <div className="flex flex-col gap-4 xl:overflow-y-auto xl:max-h-[calc(100vh-180px)] xl:pr-2">

          {/* Article Metadata */}
          <div className="p-5 rounded-xl border border-border bg-muted-light/10 flex flex-col gap-4">
            <h2 className="font-serif text-sm font-semibold text-foreground pb-2 border-b border-border/20">Article Details</h2>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-serif focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Description / Excerpt</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="A short description shown in listings..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-mono text-muted cursor-pointer">
                <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} className="rounded border-border" />
                <span>Draft</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-mono text-muted cursor-pointer">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-border" />
                <span>Featured</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-mono text-muted cursor-pointer">
                <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} className="rounded border-border" />
                <span>Archived</span>
              </label>
            </div>
          </div>

          {/* Publishing */}
          <div className="p-5 rounded-xl border border-border bg-muted-light/10 flex flex-col gap-4">
            <h2 className="font-serif text-sm font-semibold text-foreground pb-2 border-b border-border/20">Publishing</h2>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Schedule Publish</label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <span className="font-mono text-[9px] text-muted">Leave blank to publish immediately.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">SEO Slug</label>
              <div className="flex items-center px-3 py-2 rounded-lg border border-border bg-muted-light/40 font-mono text-xs text-muted break-all">
                /writings/{initialPost.metadata.slug}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 rounded-xl border border-border/40 bg-muted-light/5">
            <p className="font-mono text-[9px] text-muted leading-relaxed uppercase tracking-wider mb-2">Editor shortcuts</p>
            <div className="flex flex-col gap-1.5 font-mono text-[10px] text-muted">
              <div className="flex justify-between"><span>Save</span><kbd className="px-1.5 py-0.5 border border-border rounded text-[8px]">⌘S</kbd></div>
              <div className="flex justify-between"><span>Slash command</span><kbd className="px-1.5 py-0.5 border border-border rounded text-[8px]">/</kbd></div>
              <div className="flex justify-between"><span>Bold</span><kbd className="px-1.5 py-0.5 border border-border rounded text-[8px]">⌘B</kbd></div>
              <div className="flex justify-between"><span>Italic</span><kbd className="px-1.5 py-0.5 border border-border rounded text-[8px]">⌘I</kbd></div>
              <div className="flex justify-between"><span>Link</span><kbd className="px-1.5 py-0.5 border border-border rounded text-[8px]">⌘K</kbd></div>
              <div className="flex justify-between"><span>Undo / Redo</span><kbd className="px-1.5 py-0.5 border border-border rounded text-[8px]">⌘Z / ⌘⇧Z</kbd></div>
            </div>
          </div>
        </div>

        {/* Right: TipTap Rich Editor */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Rich Editor — WYSIWYG</label>
            <span className="font-mono text-[9px] text-muted hidden sm:block">Type <kbd className="px-1 border border-border rounded text-[8px]">/</kbd> for slash commands</span>
          </div>
          <TipTapEditor
            content={content}
            onChange={setContent}
            onSave={() => handleSave(false)}
          />
        </div>
      </div>
    </div>
  );
}
