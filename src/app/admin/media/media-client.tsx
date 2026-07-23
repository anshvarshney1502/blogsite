"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, Trash2, Search, Copy, Image as ImageIcon,
  Film, FileText, RefreshCw, CheckCircle, AlertCircle, X,
  Grid, List, FolderOpen
} from "lucide-react";

interface MediaFile {
  id: string;
  url: string;
  name: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
  createdAt?: string;
}

export default function MediaLibraryClient() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [source, setSource] = useState<"local" | "cloudinary">("local");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Premium Modal State
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm?: () => void; isConfirm: boolean } | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" }[]>([]);

  const triggerToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({ isOpen: true, title, message, onConfirm, isConfirm: true });
  };



  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        setSource(data.source || "local");
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = useCallback(async (uploadFiles: FileList | File[]) => {
    const fileArray = Array.from(uploadFiles);
    if (!fileArray.length) return;

    setUploading(true);
    setUploadProgress(0);

    const step = Math.floor(100 / fileArray.length);
    for (const file of fileArray) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        if (!res.ok) {
          const errData = await res.json();
          triggerToast(`Failed to upload ${file.name}: ${errData.error || "Server error"}`, "error");
        } else {
          triggerToast(`Successfully uploaded ${file.name}`, "success");
        }
      } catch {
        triggerToast(`Network error uploading ${file.name}`, "error");
      }
      setUploadProgress((prev) => Math.min(prev + step, 95));
    }

    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
      fetchFiles();
    }, 600);
  }, [fetchFiles, triggerToast]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        triggerToast(`Delete failed: ${errData.error || "Server error"}`, "error");
        return;
      }
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      triggerToast("File deleted successfully", "success");
    } catch {
      triggerToast("Network error: Unable to delete file", "error");
    }
  }, [triggerToast]);

  const handleBulkDelete = useCallback(async () => {
    if (!selected.size) return;
    openConfirm("Bulk Deletion", `Are you sure you want to delete ${selected.size} file(s) permanently?`, async () => {
      for (const id of Array.from(selected)) {
        await handleDelete(id);
      }
      setSelected(new Set());
    });
  }, [selected, handleDelete]);

  const copyUrl = useCallback((file: MediaFile) => {
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    triggerToast("URL copied to clipboard", "success");
    setTimeout(() => setCopiedId(null), 2000);
  }, [triggerToast]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Drag & Drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.format.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes > 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const fileIcon = (format: string) => {
    if (/^(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(format)) return <ImageIcon className="h-4 w-4" />;
    if (/^(mp4|mov|webm)$/i.test(format)) return <Film className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const isImage = (format: string) => /^(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(format);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/20">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Media Library</h1>
          <p className="font-mono text-xs text-muted mt-1">
            {files.length} files · Storage: {source === "cloudinary" ? "☁ Cloudinary CDN" : "💾 Local disk"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/5 font-mono text-xs cursor-pointer active-tactile"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete {selected.size}
            </button>
          )}
          <button
            onClick={fetchFiles}
            className="p-2 text-muted hover:text-foreground border border-border rounded-lg hover:bg-muted-light/40 transition-colors cursor-pointer active-tactile"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-mono text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer active-tactile"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl">
          <Upload className="h-4 w-4 text-accent animate-bounce" />
          <div className="flex-1">
            <div className="flex justify-between font-mono text-xs text-muted mb-1.5">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 bg-muted-light/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-border/60 hover:border-accent/40 hover:bg-muted-light/10"
        }`}
      >
        <Upload className={`h-8 w-8 transition-colors ${isDragging ? "text-accent" : "text-muted"}`} />
        <div className="text-center">
          <p className="font-mono text-xs text-muted">Drag & drop files here or <span className="text-accent underline">click to browse</span></p>
          <p className="font-mono text-[9px] text-muted mt-1">Supports images, videos, PDFs · Bulk upload supported</p>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted">{filtered.length} files</span>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-muted-light text-foreground" : "text-muted hover:text-foreground"}`}
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors cursor-pointer border-l border-border ${viewMode === "list" ? "bg-muted-light text-foreground" : "text-muted hover:text-foreground"}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* File Grid / List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 font-mono text-xs text-muted">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading media...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <FolderOpen className="h-10 w-10 text-muted/40" />
          <p className="font-mono text-xs text-muted">No files found. Upload something to get started.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((file) => (
            <div
              key={file.id}
              onClick={() => toggleSelect(file.id)}
              className={`group relative aspect-square rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 ${
                selected.has(file.id)
                  ? "ring-2 ring-accent border-accent"
                  : "border-border hover:border-accent/40"
              }`}
            >
              {isImage(file.format) ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted-light/30 flex flex-col items-center justify-center gap-2 text-muted">
                  {fileIcon(file.format)}
                  <span className="font-mono text-[9px] uppercase">{file.format}</span>
                </div>
              )}

              {/* Selection Indicator */}
              {selected.has(file.id) && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <p className="text-white font-mono text-[8px] text-center line-clamp-2 leading-relaxed">{file.name}</p>
                <p className="text-white/60 font-mono text-[7px]">{formatSize(file.size)}</p>
                <div className="flex gap-1.5 mt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(file); }}
                    className="p-1.5 bg-white/20 rounded hover:bg-white/30 transition-colors text-white cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedId === file.id ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                    className="p-1.5 bg-red-500/40 rounded hover:bg-red-500/60 transition-colors text-white cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted-light/20">
                <th className="px-4 py-3 text-left font-mono text-[10px] text-muted uppercase tracking-wider w-8">
                  <input type="checkbox" onChange={(e) => {
                    if (e.target.checked) setSelected(new Set(filtered.map(f => f.id)));
                    else setSelected(new Set());
                  }} />
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-muted uppercase tracking-wider">File</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-muted uppercase tracking-wider">Format</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-muted uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-right font-mono text-[10px] text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((file) => (
                <tr key={file.id} className={`hover:bg-muted-light/10 ${selected.has(file.id) ? "bg-accent/5" : ""}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(file.id)} onChange={() => toggleSelect(file.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg border border-border overflow-hidden shrink-0 bg-muted-light/20 flex items-center justify-center">
                        {isImage(file.format) ? (
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-muted">{fileIcon(file.format)}</span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-foreground truncate max-w-[200px]">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted uppercase">{file.format}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-muted">{formatSize(file.size)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => copyUrl(file)}
                        className="p-1.5 text-muted hover:text-foreground rounded hover:bg-muted-light/40 cursor-pointer"
                        title="Copy URL"
                        aria-label={`Copy URL for ${file.name}`}
                      >
                        {copiedId === file.id ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                     </button>
                      <button
                        onClick={() => openConfirm("Delete File", `Are you sure you want to delete "${file.name}" permanently?`, () => handleDelete(file.id))}
                        className="p-1.5 text-muted hover:text-red-500 rounded hover:bg-red-500/5 cursor-pointer"
                        title="Delete"
                        aria-label={`Delete ${file.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cloudinary notice */}
      {source === "local" && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-muted-light/10">
          <AlertCircle className="h-4 w-4 text-muted mt-0.5 shrink-0" />
          <div>
            <p className="font-mono text-[10px] text-muted">
              Files stored on <strong>local disk</strong>. To enable Cloudinary CDN, add{" "}
              <code className="px-1 bg-muted-light border border-border rounded text-[9px]">CLOUDINARY_CLOUD_NAME</code>,{" "}
              <code className="px-1 bg-muted-light border border-border rounded text-[9px]">CLOUDINARY_API_KEY</code>, and{" "}
              <code className="px-1 bg-muted-light border border-border rounded text-[9px]">CLOUDINARY_API_SECRET</code> to your{" "}
              <code className="px-1 bg-muted-light border border-border rounded text-[9px]">.env</code> file.
            </p>
          </div>
        </div>
      )}

      {/* Premium Confirm Modal */}
      {modal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background/90 p-6 shadow-2xl backdrop-blur-md animate-scale-up">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{modal.title}</h3>
            <p className="font-sans text-xs text-muted leading-relaxed mb-6">{modal.message}</p>
            <div className="flex justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setModal(null)}
                className="px-3.5 py-2 border border-border rounded-lg hover:bg-muted-light transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {modal.isConfirm && (
                <button
                  onClick={() => {
                    modal.onConfirm?.();
                    setModal(null);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Premium Toast Tray */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 p-3.5 rounded-xl border shadow-lg backdrop-blur-md font-mono text-xs transition-all duration-300 animate-slide-in-right ${
              t.type === "error"
                ? "bg-red-500/10 border-red-500/20 text-red-500"
                : "bg-green-500/10 border-green-500/20 text-green-500"
            }`}
          >
            {t.type === "error" ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />}
            <span className="leading-snug">{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
