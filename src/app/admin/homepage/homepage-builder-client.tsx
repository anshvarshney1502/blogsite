"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Eye, EyeOff, GripVertical, ChevronUp, ChevronDown,
  Copy, Trash2, Save, RefreshCw, Settings, CheckCircle,
  LayoutTemplate, Type, Image as ImageIcon, AlignLeft
} from "lucide-react";

interface SectionData {
  [key: string]: string | undefined;
}

interface Section {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  order: number;
  data: SectionData;
}

type EditField = {
  key: string;
  label: string;
  type: "text" | "textarea";
  hint?: string;
};

const SECTION_FIELDS: Record<string, EditField[]> = {
  hero: [
    { key: "badge", label: "Badge Text", type: "text", hint: "Short label shown above the title" },
    { key: "title", label: "Hero Title", type: "textarea", hint: "Wrap italic parts with [square brackets]" },
    { key: "description", label: "Description", type: "textarea" },
  ],
  latest_writings: [
    { key: "sectionNumber", label: "Section Number", type: "text", hint: "e.g. 01" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "subheading", label: "Subheading", type: "text" },
  ],
  featured_essay: [
    { key: "sectionNumber", label: "Section Number", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
  ],
  popular_topics: [
    { key: "sectionNumber", label: "Section Number", type: "text" },
  ],
  reading_collections: [
    { key: "sectionNumber", label: "Section Number", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
  ],
  recent_notes: [
    { key: "sectionNumber", label: "Section Number", type: "text" },
    { key: "heading", label: "Heading", type: "text" },
    { key: "subheading", label: "Subheading", type: "text" },
  ],
  quote: [],
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  hero: <Type className="h-4 w-4" />,
  latest_writings: <AlignLeft className="h-4 w-4" />,
  featured_essay: <ImageIcon className="h-4 w-4" />,
  popular_topics: <LayoutTemplate className="h-4 w-4" />,
  reading_collections: <LayoutTemplate className="h-4 w-4" />,
  recent_notes: <AlignLeft className="h-4 w-4" />,
  quote: <Type className="h-4 w-4" />,
};

interface HomepageBuilderProps {
  initialSections: Section[];
}

export default function HomepageBuilderClient({ initialSections }: HomepageBuilderProps) {
  const [sections, setSections] = useState<Section[]>(
    [...initialSections].sort((a, b) => a.order - b.order)
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<SectionData>({});
  const dragSrc = useRef<number | null>(null);

  const save = useCallback(async (toSave: Section[]) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: toSave }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Save failed. Try again.");
      }
    } catch {
      alert("Server error.");
    }
    setSaving(false);
  }, []);

  const toggleVisible = (id: string) => {
    const next = sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    setSections(next);
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((s, i) => ({ ...s, order: i }));
    setSections(reordered);
  };

  const duplicateSection = (section: Section) => {
    const newSec: Section = {
      ...section,
      id: `${section.id}-copy-${Date.now()}`,
      label: `${section.label} (Copy)`,
      order: sections.length,
    };
    setSections([...sections, newSec]);
  };

  const deleteSection = (id: string) => {
    if (!confirm("Remove this section from the homepage?")) return;
    setSections(sections.filter(s => s.id !== id));
  };

  const openEdit = (section: Section) => {
    setEditingId(section.id);
    setEditData({ ...section.data });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = () => {
    const next = sections.map(s =>
      s.id === editingId ? { ...s, data: { ...editData } } : s
    );
    setSections(next);
    closeEdit();
  };

  // Drag & Drop reorder
  const handleDragStart = (index: number) => { dragSrc.current = index; };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragSrc.current === null || dragSrc.current === index) return;
    const next = [...sections];
    const [moved] = next.splice(dragSrc.current, 1);
    next.splice(index, 0, moved);
    dragSrc.current = index;
    setSections(next.map((s, i) => ({ ...s, order: i })));
  };
  const handleDragEnd = () => { dragSrc.current = null; };

  const publishedCount = sections.filter(s => s.visible).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/20">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Homepage Builder</h1>
          <p className="font-mono text-xs text-muted mt-1">
            {publishedCount} of {sections.length} sections visible · Drag to reorder
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-500 font-mono text-xs">
              <CheckCircle className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg font-mono text-xs text-muted hover:text-foreground hover:bg-muted-light/40 transition-colors active-tactile"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview Site
          </a>
          <button
            onClick={() => save(sections)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-mono text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50 active-tactile"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl border border-border/40 bg-accent/5 font-mono text-[10px] text-muted flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <span>
          Drag sections by their grip handle to reorder. Toggle visibility with the eye icon. Edit text content with the settings icon. Changes apply to the live site after clicking <strong>Save & Publish</strong>.
        </span>
      </div>

      {/* Section List */}
      <div className="flex flex-col gap-3">
        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing ${
              section.visible
                ? "border-border bg-background hover:border-accent/30 hover:bg-muted-light/5"
                : "border-border/40 bg-muted-light/10 opacity-60"
            }`}
          >
            {/* Drag Handle */}
            <div className="text-muted/40 group-hover:text-muted transition-colors shrink-0">
              <GripVertical className="h-5 w-5" />
            </div>

            {/* Type Icon */}
            <div className={`p-2 rounded-lg border shrink-0 ${section.visible ? "border-border text-accent bg-accent/5" : "border-border/40 text-muted"}`}>
              {TYPE_ICON[section.type] || <LayoutTemplate className="h-4 w-4" />}
            </div>

            {/* Section Info */}
            <div className="flex-1 min-w-0">
              <p className="font-serif text-sm font-semibold text-foreground">{section.label}</p>
              <p className="font-mono text-[10px] text-muted mt-0.5">
                type: <span className="text-accent/80">{section.type}</span> · order: {index + 1}
                {section.data.heading && ` · "${section.data.heading}"`}
              </p>
            </div>

            {/* Visibility Badge */}
            <div className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[9px] border shrink-0 ${
              section.visible
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-muted/10 text-muted border-border"
            }`}>
              {section.visible ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
              {section.visible ? "Visible" : "Hidden"}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => moveSection(index, -1)}
                disabled={index === 0}
                className="p-1.5 text-muted hover:text-foreground rounded hover:bg-muted-light/40 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
                aria-label={`Move ${section.label} up`}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => moveSection(index, 1)}
                disabled={index === sections.length - 1}
                className="p-1.5 text-muted hover:text-foreground rounded hover:bg-muted-light/40 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
                aria-label={`Move ${section.label} down`}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => toggleVisible(section.id)}
                className="p-1.5 text-muted hover:text-foreground rounded hover:bg-muted-light/40 transition-colors cursor-pointer"
                title={section.visible ? "Hide section" : "Show section"}
                aria-label={section.visible ? `Hide ${section.label}` : `Show ${section.label}`}
              >
                {section.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              {SECTION_FIELDS[section.type]?.length > 0 && (
                <button
                  onClick={() => openEdit(section)}
                  className="p-1.5 text-muted hover:text-accent rounded hover:bg-accent/5 transition-colors cursor-pointer"
                  title="Edit content"
                  aria-label={`Edit ${section.label} content`}
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => duplicateSection(section)}
                className="p-1.5 text-muted hover:text-foreground rounded hover:bg-muted-light/40 transition-colors cursor-pointer"
                title="Duplicate section"
                aria-label={`Duplicate ${section.label}`}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                className="p-1.5 text-muted hover:text-red-500 rounded hover:bg-red-500/5 transition-colors cursor-pointer"
                title="Remove section"
                aria-label={`Delete ${section.label}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground">Edit Section</h2>
                <p className="font-mono text-[10px] text-muted mt-0.5">{sections.find(s => s.id === editingId)?.label}</p>
              </div>
              <button
                onClick={closeEdit}
                className="p-2 text-muted hover:text-foreground hover:bg-muted-light/40 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              {(SECTION_FIELDS[sections.find(s => s.id === editingId)?.type || ""] || []).map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] text-muted uppercase tracking-wider">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={editData[field.key] ?? ""}
                      onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editData[field.key] ?? ""}
                      onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  )}
                  {field.hint && <p className="font-mono text-[9px] text-muted">{field.hint}</p>}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted-light/10">
              <button
                onClick={closeEdit}
                className="px-4 py-2 border border-border rounded-lg font-mono text-xs text-muted hover:text-foreground hover:bg-muted-light/40 cursor-pointer active-tactile"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-mono text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer active-tactile"
              >
                <Save className="h-3.5 w-3.5" />
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
