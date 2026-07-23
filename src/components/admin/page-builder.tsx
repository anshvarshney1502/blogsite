/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Plus,
  Image as ImageIcon,
  Type,
  Play,
  Minus,
  Quote,
  Code2,
  Heading1,
  Heading2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Palette,
  Save,
  Rocket,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  PanelLeft,
  PanelRight,
  Layers,
  Settings2,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Copy,
  X,
} from "lucide-react";

// ─── Block Types ────────────────────────────────────────────────────────────

export type BlockType =
  | "heading1"
  | "heading2"
  | "text"
  | "image"
  | "youtube"
  | "divider"
  | "quote"
  | "code"
  | "spacer"
  | "button"
  | "columns";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  props: Record<string, string | boolean | number>;
}

// ─── Default props per type ─────────────────────────────────────────────────

const defaultProps: Record<BlockType, Record<string, string | boolean | number>> = {
  heading1:  { align: "left", color: "" },
  heading2:  { align: "left", color: "" },
  text:      { align: "left", bold: false, italic: false },
  image:     { caption: "", alt: "", align: "center", width: "100" },
  youtube:   { caption: "" },
  divider:   { style: "solid", color: "" },
  quote:     { author: "", align: "left" },
  code:      { language: "javascript" },
  spacer:    { height: "40" },
  button:    { url: "", label: "Click Here", style: "primary", align: "left" },
  columns:   { col1: "", col2: "" },
};

// ─── ID Generator ────────────────────────────────────────────────────────────

const genId = () => `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ─── Block Palette Config ────────────────────────────────────────────────────

const palette: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "heading1", label: "Heading 1",  icon: <Heading1 className="h-4 w-4" /> },
  { type: "heading2", label: "Heading 2",  icon: <Heading2 className="h-4 w-4" /> },
  { type: "text",     label: "Paragraph",  icon: <Type      className="h-4 w-4" /> },
  { type: "image",    label: "Image",      icon: <ImageIcon className="h-4 w-4" /> },
  { type: "youtube",  label: "YouTube",    icon: <Play      className="h-4 w-4" /> },
  { type: "quote",    label: "Quote",      icon: <Quote     className="h-4 w-4" /> },
  { type: "code",     label: "Code Block", icon: <Code2     className="h-4 w-4" /> },
  { type: "divider",  label: "Divider",    icon: <Minus     className="h-4 w-4" /> },
  { type: "spacer",   label: "Spacer",     icon: <AlignLeft className="h-4 w-4" /> },
  { type: "button",   label: "Button",     icon: <Link2     className="h-4 w-4" /> },
];

// ─── Single SortableBlock ────────────────────────────────────────────────────

function SortableBlock({
  block,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative rounded-xl border-2 transition-all cursor-pointer mb-3 ${
        selected
          ? "border-accent shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.15)]"
          : "border-border hover:border-accent/40"
      } bg-background`}
    >
      {/* Drag Handle + Actions */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded bg-muted-light text-muted hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Quick actions top-right */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="p-1 rounded-md bg-muted-light/80 text-muted hover:text-foreground text-[10px] hover:bg-muted-light"
          title="Duplicate block"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-md bg-red-500/10 text-red-400 hover:text-red-600 hover:bg-red-500/20"
          title="Delete block"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="p-4">
        <BlockPreview block={block} />
      </div>
    </div>
  );
}

// ─── BlockPreview ────────────────────────────────────────────────────────────

function BlockPreview({ block }: { block: Block }) {
  const align = (block.props.align as string) || "left";
  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  switch (block.type) {
    case "heading1":
      return (
        <h1
          className={`text-2xl font-bold font-serif text-foreground leading-tight ${alignClass}`}
          style={block.props.color ? { color: block.props.color as string } : {}}
        >
          {block.content || "Heading 1"}
        </h1>
      );
    case "heading2":
      return (
        <h2
          className={`text-xl font-semibold font-serif text-foreground ${alignClass}`}
          style={block.props.color ? { color: block.props.color as string } : {}}
        >
          {block.content || "Heading 2"}
        </h2>
      );
    case "text":
      return (
        <p
          className={`text-sm text-foreground/90 leading-relaxed ${alignClass} ${block.props.bold ? "font-bold" : ""} ${block.props.italic ? "italic" : ""}`}
        >
          {block.content || "Start typing your paragraph here..."}
        </p>
      );
    case "image":
      return block.content ? (
        <div className={`flex flex-col ${align === "center" ? "items-center" : align === "right" ? "items-end" : "items-start"}`}>
          <img
            src={block.content}
            alt={(block.props.alt as string) || ""}
            className="rounded-lg max-w-full object-cover"
            style={{ width: `${block.props.width || 100}%` }}
          />
          {block.props.caption && (
            <p className="text-xs text-muted mt-1.5 italic">{block.props.caption as string}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-border text-muted gap-2">
          <ImageIcon className="h-8 w-8 opacity-40" />
          <span className="text-xs font-mono">Add image URL or upload</span>
        </div>
      );
    case "youtube": {
      const videoId = extractYouTubeId(block.content);
      return videoId ? (
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 rounded-lg border-2 border-dashed border-border text-muted gap-2">
          <Play className="h-8 w-8 opacity-40" />
          <span className="text-xs font-mono">Paste YouTube URL</span>
        </div>
      );
    }
    case "quote":
      return (
        <blockquote className="border-l-4 border-accent pl-4 py-2">
          <p className="text-sm italic text-foreground/80">
            {block.content || "Add your quote here..."}
          </p>
          {block.props.author && (
            <cite className="text-xs text-muted mt-1 block">— {block.props.author as string}</cite>
          )}
        </blockquote>
      );
    case "code":
      return (
        <pre className="bg-muted-light/20 border border-border rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
          <code>{block.content || "// your code here"}</code>
        </pre>
      );
    case "divider":
      return (
        <hr
          className="border-border"
          style={{
            borderStyle: (block.props.style as string) || "solid",
            borderColor: (block.props.color as string) || undefined,
          }}
        />
      );
    case "spacer":
      return (
        <div
          className="flex items-center justify-center text-[10px] text-muted/40 font-mono border border-dashed border-border/30 rounded"
          style={{ height: `${block.props.height || 40}px` }}
        >
          spacer {block.props.height}px
        </div>
      );
    case "button":
      return (
        <div className={`flex ${align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"}`}>
          <a
            href={block.props.url as string || "#"}
            className={`inline-flex px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              block.props.style === "primary"
                ? "bg-foreground text-background"
                : block.props.style === "outline"
                ? "border-2 border-foreground text-foreground"
                : "bg-accent text-white"
            }`}
            onClick={e => e.preventDefault()}
          >
            {block.props.label as string || "Button"}
          </a>
        </div>
      );
    default:
      return <div className="text-xs text-muted font-mono">Unknown block: {block.type}</div>;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const m =
    url.match(/[?&]v=([^&#]+)/) ||
    url.match(/youtu\.be\/([^?&#]+)/) ||
    url.match(/embed\/([^?&#]+)/);
  return m ? m[1] : null;
}

// ─── Props Panel ─────────────────────────────────────────────────────────────

function PropsPanel({
  block,
  onChange,
}: {
  block: Block | null;
  onChange: (id: string, field: "content" | "props", value: string | Record<string, string | boolean | number>) => void;
}) {
  if (!block)
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted gap-3 px-4">
        <Layers className="h-10 w-10 opacity-30" />
        <p className="text-xs font-mono text-center">
          Click a block on the canvas to edit its properties
        </p>
      </div>
    );

  const updateProp = (key: string, val: string | boolean | number) => {
    onChange(block.id, "props", { ...block.props, [key]: val });
  };

  return (
    <div className="flex flex-col gap-5 px-4 py-4 text-xs overflow-y-auto h-full">
      <div>
        <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-3 border-b border-border/40 pb-2">
          {block.type.toUpperCase()} BLOCK SETTINGS
        </p>

        {/* Content */}
        {["heading1", "heading2", "text", "quote", "code"].includes(block.type) && (
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Content</label>
            <textarea
              rows={block.type === "code" ? 8 : block.type === "text" ? 5 : 2}
              value={block.content}
              onChange={(e) => onChange(block.id, "content", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent resize-none font-mono"
              placeholder={
                block.type === "heading1" ? "Enter heading..." :
                block.type === "text" ? "Start typing..." :
                block.type === "quote" ? "Inspirational quote..." :
                block.type === "code" ? "// paste code here" : ""
              }
            />
          </div>
        )}

        {/* Image URL */}
        {block.type === "image" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Image URL</label>
              <input
                type="url"
                value={block.content}
                onChange={(e) => onChange(block.id, "content", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Alt Text</label>
              <input type="text" value={(block.props.alt as string) || ""} onChange={(e) => updateProp("alt", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Describe the image" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Caption</label>
              <input type="text" value={(block.props.caption as string) || ""} onChange={(e) => updateProp("caption", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Optional caption" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Width %</label>
              <input type="number" min={10} max={100} value={(block.props.width as number) || 100} onChange={(e) => updateProp("width", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
        )}

        {/* YouTube URL */}
        {block.type === "youtube" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">YouTube URL</label>
              <input type="url" value={block.content} onChange={(e) => onChange(block.id, "content", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Caption</label>
              <input type="text" value={(block.props.caption as string) || ""} onChange={(e) => updateProp("caption", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Optional caption" />
            </div>
          </div>
        )}

        {/* Button */}
        {block.type === "button" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Button Label</label>
              <input type="text" value={(block.props.label as string) || ""} onChange={(e) => updateProp("label", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Click Here" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">URL</label>
              <input type="url" value={(block.props.url as string) || ""} onChange={(e) => updateProp("url", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent" placeholder="https://..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Style</label>
              <select value={(block.props.style as string) || "primary"} onChange={(e) => updateProp("style", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none">
                <option value="primary">Primary (Dark)</option>
                <option value="outline">Outline</option>
                <option value="accent">Accent Color</option>
              </select>
            </div>
          </div>
        )}

        {/* Quote */}
        {block.type === "quote" && (
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Author</label>
            <input type="text" value={(block.props.author as string) || ""} onChange={(e) => updateProp("author", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent" placeholder="Author name" />
          </div>
        )}

        {/* Spacer */}
        {block.type === "spacer" && (
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Height (px)</label>
            <input type="number" min={8} max={400} value={(block.props.height as number) || 40} onChange={(e) => updateProp("height", Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
        )}

        {/* Code language */}
        {block.type === "code" && (
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Language</label>
            <select value={(block.props.language as string) || "javascript"} onChange={(e) => updateProp("language", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none">
              {["javascript","typescript","python","html","css","bash","json","rust","go","sql"].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        )}

        {/* Alignment (for relevant block types) */}
        {["heading1","heading2","text","image","quote","button"].includes(block.type) && (
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Alignment</label>
            <div className="flex gap-1">
              {[
                { val: "left", icon: <AlignLeft className="h-3.5 w-3.5" /> },
                { val: "center", icon: <AlignCenter className="h-3.5 w-3.5" /> },
                { val: "right", icon: <AlignRight className="h-3.5 w-3.5" /> },
              ].map(({ val, icon }) => (
                <button
                  key={val}
                  onClick={() => updateProp("align", val)}
                  className={`flex-1 py-1.5 flex items-center justify-center rounded-lg border transition-colors ${
                    block.props.align === val
                      ? "bg-accent/10 border-accent text-accent"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text formatting */}
        {block.type === "text" && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => updateProp("bold", !block.props.bold)}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg border text-xs transition-colors ${block.props.bold ? "bg-accent/10 border-accent text-accent" : "border-border text-muted hover:text-foreground"}`}>
              <Bold className="h-3.5 w-3.5" /> Bold
            </button>
            <button onClick={() => updateProp("italic", !block.props.italic)}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg border text-xs transition-colors ${block.props.italic ? "bg-accent/10 border-accent text-accent" : "border-border text-muted hover:text-foreground"}`}>
              <Italic className="h-3.5 w-3.5" /> Italic
            </button>
          </div>
        )}

        {/* Color picker */}
        {["heading1","heading2","divider"].includes(block.type) && (
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider flex items-center gap-1">
              <Palette className="h-3 w-3" /> Color (optional)
            </label>
            <div className="flex gap-2 items-center">
              <input type="color" value={(block.props.color as string) || "#000000"} onChange={(e) => updateProp("color", e.target.value)}
                className="h-8 w-10 rounded border border-border cursor-pointer bg-transparent" />
              <input type="text" value={(block.props.color as string) || ""} onChange={(e) => updateProp("color", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none" placeholder="#000000 or css color" />
              {block.props.color && (
                <button onClick={() => updateProp("color", "")} className="p-1 text-muted hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page Builder ────────────────────────────────────────────────────────

interface PageBuilderProps {
  pageSlug: string;        // e.g. "home", "about"
  pageLabel: string;       // display name
  initialBlocks?: Block[];
}

export default function PageBuilder({ pageSlug, pageLabel, initialBlocks = [] }: PageBuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [history, setHistory] = useState<Block[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "published" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  // ── push history snapshot
  const pushHistory = useCallback((newBlocks: Block[]) => {
    setHistory((h) => {
      const trimmed = h.slice(0, historyIndex + 1);
      return [...trimmed, newBlocks];
    });
    setHistoryIndex((i) => i + 1);
  }, [historyIndex]);

  const updateBlocks = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    pushHistory(newBlocks);
  }, [pushHistory]);

  // Undo / Redo
  const undo = () => {
    if (historyIndex <= 0) return;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    setBlocks(history[newIdx]);
  };
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    setBlocks(history[newIdx]);
  };

  // ── Add block
  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: genId(),
      type,
      content: "",
      props: { ...defaultProps[type] },
    };
    const newBlocks = [...blocks, newBlock];
    updateBlocks(newBlocks);
    setSelectedId(newBlock.id);
  };

  // ── Delete block
  const deleteBlock = (id: string) => {
    updateBlocks(blocks.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // ── Duplicate block
  const duplicateBlock = (id: string) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const original = blocks[idx];
    const dup: Block = { ...original, id: genId(), props: { ...original.props } };
    const newBlocks = [...blocks];
    newBlocks.splice(idx + 1, 0, dup);
    updateBlocks(newBlocks);
    setSelectedId(dup.id);
  };

  // ── Update block content / props
  const updateBlock = (
    id: string,
    field: "content" | "props",
    value: string | Record<string, string | boolean | number>
  ) => {
    const newBlocks = blocks.map((b) =>
      b.id === id ? { ...b, [field]: value } : b
    );
    setBlocks(newBlocks);
    // Debounced history push (avoid spamming on every keystroke)
    clearTimeout((window as any).__histTimer);
    (window as any).__histTimer = setTimeout(() => pushHistory(newBlocks), 1000);
  };

  // ── Drag-and-drop
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIdx, newIdx);
    updateBlocks(reordered);
  };

  // ── Save (draft)
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/page-builder/${pageSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("saved");
        setStatusMsg("Draft saved");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        throw new Error(data.error || "Save failed");
      }
    } catch (e: unknown) {
      setStatus("error");
      setStatusMsg((e as Error).message);
      setTimeout(() => setStatus("idle"), 4000);
    } finally {
      setSaving(false);
    }
  };

  // ── Publish (write + revalidate)
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/page-builder/${pageSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks, publish: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("published");
        setStatusMsg("Published live!");
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        throw new Error(data.error || "Publish failed");
      }
    } catch (e: unknown) {
      setStatus("error");
      setStatusMsg((e as Error).message);
      setTimeout(() => setStatus("idle"), 4000);
    } finally {
      setPublishing(false);
    }
  };

  const previewWidth =
    previewDevice === "mobile" ? "375px" : previewDevice === "tablet" ? "768px" : "100%";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 md:-m-8 overflow-hidden bg-muted-light/5">
      {/* ── Top Toolbar ── */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border bg-background shrink-0 gap-4">
        {/* Left: panel toggles + undo/redo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="p-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:bg-muted-light/40 transition-colors"
            title="Toggle block palette"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button onClick={undo} disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:bg-muted-light/40 transition-colors disabled:opacity-30"
            title="Undo">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:bg-muted-light/40 transition-colors disabled:opacity-30"
            title="Redo">
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* Center: page label + preview toggles */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted uppercase tracking-wider hidden sm:block">
            Editing: <span className="text-foreground font-semibold">{pageLabel}</span>
          </span>
          <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
            {[
              { key: "desktop", icon: <Monitor className="h-3.5 w-3.5" /> },
              { key: "tablet",  icon: <Tablet  className="h-3.5 w-3.5" /> },
              { key: "mobile",  icon: <Smartphone className="h-3.5 w-3.5" /> },
            ].map(({ key, icon }) => (
              <button
                key={key}
                onClick={() => { setPreviewDevice(key as "desktop" | "tablet" | "mobile"); setShowPreview(true); }}
                className={`p-1.5 transition-colors ${previewDevice === key && showPreview ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground"}`}
                title={`Preview ${key}`}
              >
                {icon}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${showPreview ? "bg-accent/10 border-accent text-accent" : "border-border text-muted hover:text-foreground"}`}
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>

        {/* Right: status + save + publish */}
        <div className="flex items-center gap-2">
          {status !== "idle" && (
            <span className={`flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-full border ${
              status === "published" ? "bg-green-500/10 border-green-500/30 text-green-500" :
              status === "saved" ? "bg-blue-500/10 border-blue-500/30 text-blue-500" :
              "bg-red-500/10 border-red-500/30 text-red-500"
            }`}>
              {status === "error" ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
              {statusMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-mono hover:text-foreground hover:bg-muted-light/40 transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-lg text-xs font-mono font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {publishing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
            Publish
          </button>
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="p-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:bg-muted-light/40 transition-colors"
            title="Toggle properties panel"
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Panel: Block Palette */}
        {leftPanelOpen && !showPreview && (
          <div className="w-52 shrink-0 border-r border-border bg-background overflow-y-auto">
            <div className="p-3">
              <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-3 px-1">Add Blocks</p>
              <div className="flex flex-col gap-1">
                {palette.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-transparent hover:border-border hover:bg-muted-light/30 text-xs text-muted hover:text-foreground transition-all active-tactile text-left w-full"
                  >
                    <span className="text-accent">{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Block count */}
              <div className="mt-4 pt-3 border-t border-border/40">
                <p className="font-mono text-[10px] text-muted text-center">
                  {blocks.length} block{blocks.length !== 1 ? "s" : ""} on canvas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Center: Canvas or Preview */}
        <div className="flex-1 overflow-y-auto bg-muted-light/5">
          {showPreview ? (
            // ── Preview Mode
            <div className="flex justify-center p-6 bg-muted-light/10 min-h-full">
              <div
                className="bg-background rounded-xl border border-border shadow-xl transition-all duration-300 overflow-hidden"
                style={{ width: previewWidth, minHeight: "600px" }}
              >
                <div className="p-6 md:p-10 max-w-3xl mx-auto">
                  {blocks.map((block) => (
                    <div key={block.id} className="mb-4">
                      <BlockPreview block={block} />
                    </div>
                  ))}
                  {blocks.length === 0 && (
                    <p className="text-center text-muted text-sm font-mono py-20">
                      No blocks yet. Close preview and add some!
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // ── Edit Canvas
            <div className="p-6 max-w-3xl mx-auto">
              {blocks.length === 0 && (
                <div
                  className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-2xl text-muted gap-3 cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all"
                  onClick={() => addBlock("heading1")}
                >
                  <Plus className="h-10 w-10 opacity-30" />
                  <p className="text-sm font-mono">Click a block type in the left panel to start building</p>
                  <p className="text-xs text-muted/60">or click here to add a Heading 1</p>
                </div>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="ml-8">
                    {blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        selected={selectedId === block.id}
                        onSelect={() => setSelectedId(block.id)}
                        onDelete={() => deleteBlock(block.id)}
                        onDuplicate={() => duplicateBlock(block.id)}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeId ? (
                    <div className="rounded-xl border-2 border-accent bg-background shadow-xl opacity-80 p-4">
                      <BlockPreview block={blocks.find((b) => b.id === activeId)!} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              {/* Add block button at bottom */}
              {blocks.length > 0 && (
                <div className="ml-8 mt-2">
                  <button
                    onClick={() => addBlock("text")}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-xs text-muted hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-all font-mono"
                  >
                    <Plus className="h-4 w-4" /> Add Block
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Properties */}
        {rightPanelOpen && !showPreview && (
          <div className="w-64 shrink-0 border-l border-border bg-background overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
              <Settings2 className="h-3.5 w-3.5 text-muted" />
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Properties</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PropsPanel
                block={selectedBlock}
                onChange={updateBlock}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
