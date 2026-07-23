"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, Search, Filter, 
  Trash2, Edit, ExternalLink, CheckCircle, Clock, Copy, Archive, RotateCcw
} from "lucide-react";
import { PostMetadata } from "@/lib/mdx";

interface AdminClientProps {
  initialPosts: PostMetadata[];
}

export default function AdminClient({ initialPosts }: AdminClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<PostMetadata[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, published, draft
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New post form state
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState("Artificial Intelligence");
  const [loading, setLoading] = useState(false);

  const postsPerPage = 5;

  // Sync posts when server props update
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Autocomplete slug on title change
  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    setNewSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  // Create post handler
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSlug) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, slug: newSlug, category: newCategory })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setNewTitle("");
        setNewSlug("");
        router.refresh();
      } else {
        alert(data.error || "Failed to create post.");
      }
    } catch {
      alert("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  // Delete post handler
  const handleDeletePost = async (slug: string) => {
    if (!confirm("Are you sure you want to permanently delete this writing?")) return;

    try {
      const res = await fetch(`/api/admin/posts/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter(p => p.slug !== slug));
        router.refresh();
      } else {
        alert("Failed to delete post.");
      }
    } catch {
      alert("Server connection failed.");
    }
  };

  // Duplicate post handler
  const handleDuplicatePost = async (post: PostMetadata) => {
    const newSlugBase = `${post.slug}-copy`;
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${post.title} (Copy)`, slug: newSlugBase, category: post.category })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.refresh();
      } else {
        alert(data.error || "Failed to duplicate post.");
      }
    } catch {
      alert("Server connection failed.");
    }
  };

  // Archive / Restore handler
  const handleToggleArchive = async (post: PostMetadata) => {
    const isCurrentlyArchived = (post as PostMetadata & { archived?: boolean }).archived ?? false;
    try {
      const res = await fetch(`/api/admin/posts/${post.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: { ...post, archived: !isCurrentlyArchived },
          content: ""
        })
      });
      if (res.ok) {
        setPosts(posts.map(p => p.slug === post.slug ? { ...p, archived: !isCurrentlyArchived } as PostMetadata : p));
        router.refresh();
      } else {
        alert("Failed to update archive status.");
      }
    } catch {
      alert("Server connection failed.");
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isDraft = post.draft ?? true;
    const isArchived = (post as PostMetadata & { archived?: boolean }).archived ?? false;
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "published" && !isDraft && !isArchived) || 
                          (statusFilter === "draft" && isDraft && !isArchived) ||
                          (statusFilter === "archived" && isArchived);

    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Categories list for filter
  const categories = Array.from(new Set(posts.map(p => p.category)));

  // Pagination bounds
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="flex flex-col gap-8">
      {/* Title block */}
      <div className="flex items-center justify-between pb-4 border-b border-border/20">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Content Management</h1>
          <p className="text-xs text-muted font-mono uppercase tracking-wider mt-1">Local MDX File Manager</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background font-mono text-xs font-semibold rounded-lg hover:opacity-90 active-tactile transition-opacity cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-border bg-muted-light/10 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Total Writings</span>
            <span className="font-serif text-4xl font-bold text-foreground block mt-1">{posts.length}</span>
          </div>
          <p className="text-[11px] text-muted mt-2">All indexable MDX documents</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-muted-light/10 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Published</span>
            <span className="font-serif text-4xl font-bold text-green-500 block mt-1">
              {posts.filter(p => !p.draft).length}
            </span>
          </div>
          <p className="text-[11px] text-muted mt-2">Active on public site index</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-muted-light/10 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Drafts</span>
            <span className="font-serif text-4xl font-bold text-yellow-500 block mt-1">
              {posts.filter(p => p.draft).length}
            </span>
          </div>
          <p className="text-[11px] text-muted mt-2">In progress essays</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted-light/10 p-4 rounded-xl border border-border">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted font-mono">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 border border-border rounded-lg bg-background text-xs focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 border border-border rounded-lg bg-background text-xs focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table list */}
      <div className="border border-border rounded-xl bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted-light/30 border-b border-border/80 text-[10px] font-mono text-muted uppercase tracking-wider">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {currentPosts.length > 0 ? (
                currentPosts.map((post) => (
                  <tr key={post.slug} className="hover:bg-muted-light/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-serif text-sm font-semibold text-foreground">{post.title}</div>
                      <div className="text-xs text-muted line-clamp-1 mt-0.5">{post.description}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-muted">{post.category}</td>
                    <td className="px-6 py-4 font-mono text-[10px] text-muted">{post.date}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const isArchived = (post as PostMetadata & { archived?: boolean }).archived ?? false;
                        if (isArchived) return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/10 text-muted font-mono text-[9px] font-semibold border border-border">
                            <Archive className="h-3 w-3" /> Archived
                          </span>
                        );
                        if (post.draft) return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-mono text-[9px] font-semibold border border-yellow-500/20">
                            <Clock className="h-3 w-3" /> Draft
                          </span>
                        );
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 font-mono text-[9px] font-semibold border border-green-500/20">
                            <CheckCircle className="h-3 w-3" /> Published
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[10px]">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/edit/${post.slug}`}
                          className="p-1.5 hover:text-foreground text-muted rounded-md hover:bg-muted-light/50 transition-colors active-tactile"
                          title="Edit article"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDuplicatePost(post)}
                          className="p-1.5 text-muted hover:text-foreground rounded-md hover:bg-muted-light/50 transition-colors cursor-pointer active-tactile"
                          title="Duplicate article"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleArchive(post)}
                          className="p-1.5 text-muted hover:text-foreground rounded-md hover:bg-muted-light/50 transition-colors cursor-pointer active-tactile"
                          title={(post as PostMetadata & { archived?: boolean }).archived ? "Restore article" : "Archive article"}
                        >
                          {(post as PostMetadata & { archived?: boolean }).archived 
                            ? <RotateCcw className="h-3.5 w-3.5" />
                            : <Archive className="h-3.5 w-3.5" />}
                        </button>
                        <a
                          href={`/writings/${post.slug}`}
                          target="_blank"
                          className="p-1.5 hover:text-foreground text-muted rounded-md hover:bg-muted-light/50 transition-colors active-tactile"
                          title="View live post"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeletePost(post.slug)}
                          className="p-1.5 text-muted hover:text-red-500 rounded-md hover:bg-red-500/5 transition-colors cursor-pointer active-tactile"
                          title="Permanently delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted font-mono">
                    No articles found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border/80 flex items-center justify-between font-mono text-[10px] text-muted">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 border border-border rounded-lg hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 border border-border rounded-lg hover:text-foreground cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-xl border border-border bg-background shadow-xl">
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Create New Article</h2>
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Article Title</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={newTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="My New Technical Post"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider">URL Slug</label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="my-new-technical-post"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Category</label>
                <select
                  disabled={loading}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Python">Python</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="System Design">System Design</option>
                  <option value="Open Source">Open Source</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 font-mono text-xs">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:text-foreground cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
