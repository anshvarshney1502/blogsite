/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Rocket, RefreshCw, CheckCircle, AlertCircle,
  Plus, Trash2, ChevronDown, ChevronUp,
  User, Navigation, Tag, BookOpen, StickyNote, Quote as QuoteIcon,
  Globe, Award, GraduationCap, Layers, X
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Type helpers
// ─────────────────────────────────────────────────────────────────────────────

type Status = "idle" | "saving" | "saved" | "publishing" | "published" | "error";

function useDebouncedSave(data: unknown, onSave: (d: unknown) => void, delay = 1500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSave(data), delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub‑section editors
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({
  title, icon, children, defaultOpen = true,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-muted-light/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted-light/20 transition-colors"
      >
        <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
          <span className="text-accent">{icon}</span>
          {title}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-border/40">{children}</div>}
    </div>
  );
}

function Field({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] text-muted uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-shadow";
const textareaCls = `${inputCls} resize-none`;

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

interface DbData {
  site: Record<string, string>;
  hero: Record<string, string>;
  navigation: { name: string; path: string }[];
  popular_topics: { name: string; count: number; description: string }[];
  reading_collections: { title: string; description: string; count: number; slug: string }[];
  recent_notes: { id: string; date: string; content: string }[];
  experiences: { role: string; company: string; duration: string; description: string }[];
  education: { institution: string; degree: string; duration: string }[];
  skills: string[];
  focus_areas: string[];
  currently: string;
  quote_of_the_day: { text: string; author: string };
  footer: { copyright: string; description: string };
  // allow extra keys
  [key: string]: unknown;
}

export default function ContentEditorClient({ initialData }: { initialData: DbData }) {
  const router = useRouter();
  const [db, setDb] = useState<DbData>(initialData);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState("");

  // ── helpers
  const setStatusFor = (s: Status, msg: string) => {
    setStatus(s);
    setStatusMsg(msg);
    if (s !== "saving" && s !== "publishing") setTimeout(() => setStatus("idle"), 3500);
  };

  // ── Generic deep-update helpers
  const updateSite = (key: string, val: string) =>
    setDb((d) => ({ ...d, site: { ...d.site, [key]: val } }));
  const updateHero = (key: string, val: string) =>
    setDb((d) => ({ ...d, hero: { ...d.hero, [key]: val } }));
  const updateQuote = (key: string, val: string) =>
    setDb((d) => ({ ...d, quote_of_the_day: { ...d.quote_of_the_day, [key]: val } }));
  const updateFooter = (key: string, val: string) =>
    setDb((d) => ({ ...d, footer: { ...d.footer, [key]: val } }));

  // ── Save (write to db.json, no revalidate)
  const handleSave = async (dataOverride?: unknown) => {
    setStatusFor("saving", "Saving...");
    try {
      const payload = dataOverride ?? db;
      const res = await fetch("/api/admin/content-db", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setStatusFor("saved", "Draft saved ✓");
    } catch (e: any) {
      setStatusFor("error", e.message);
    }
  };

  // ── Publish (write + revalidate)
  const handlePublish = async () => {
    setStatusFor("publishing", "Publishing...");
    try {
      const res = await fetch("/api/admin/content-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(db),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Publish failed");
      setStatusFor("published", "Published live! ✓");
      router.refresh();
    } catch (e: any) {
      setStatusFor("error", e.message);
    }
  };

  // Auto-save debounced
  useDebouncedSave(db, handleSave, 2000);

  // ── Array helpers
  const addNavItem = () =>
    setDb((d) => ({ ...d, navigation: [...d.navigation, { name: "New Link", path: "/" }] }));
  const updateNavItem = (i: number, key: "name" | "path", val: string) =>
    setDb((d) => ({ ...d, navigation: d.navigation.map((n, idx) => idx === i ? { ...n, [key]: val } : n) }));
  const removeNavItem = (i: number) =>
    setDb((d) => ({ ...d, navigation: d.navigation.filter((_, idx) => idx !== i) }));

  const addTopic = () =>
    setDb((d) => ({ ...d, popular_topics: [...d.popular_topics, { name: "New Topic", count: 0, description: "" }] }));
  const updateTopic = (i: number, key: string, val: string | number) =>
    setDb((d) => ({ ...d, popular_topics: d.popular_topics.map((t, idx) => idx === i ? { ...t, [key]: val } : t) }));
  const removeTopic = (i: number) =>
    setDb((d) => ({ ...d, popular_topics: d.popular_topics.filter((_, idx) => idx !== i) }));

  const addCollection = () =>
    setDb((d) => ({ ...d, reading_collections: [...d.reading_collections, { title: "New Collection", description: "", count: 0, slug: "new-collection" }] }));
  const updateCollection = (i: number, key: string, val: string | number) =>
    setDb((d) => ({ ...d, reading_collections: d.reading_collections.map((c, idx) => idx === i ? { ...c, [key]: val } : c) }));
  const removeCollection = (i: number) =>
    setDb((d) => ({ ...d, reading_collections: d.reading_collections.filter((_, idx) => idx !== i) }));

  const addNote = () =>
    setDb((d) => ({ ...d, recent_notes: [...d.recent_notes, { id: `note-${Date.now()}`, date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), content: "" }] }));
  const updateNote = (i: number, key: string, val: string) =>
    setDb((d) => ({ ...d, recent_notes: d.recent_notes.map((n, idx) => idx === i ? { ...n, [key]: val } : n) }));
  const removeNote = (i: number) =>
    setDb((d) => ({ ...d, recent_notes: d.recent_notes.filter((_, idx) => idx !== i) }));

  const addExperience = () =>
    setDb((d) => ({ ...d, experiences: [...d.experiences, { role: "New Role", company: "Company", duration: "2026 – Present", description: "" }] }));
  const updateExperience = (i: number, key: string, val: string) =>
    setDb((d) => ({ ...d, experiences: d.experiences.map((e, idx) => idx === i ? { ...e, [key]: val } : e) }));
  const removeExperience = (i: number) =>
    setDb((d) => ({ ...d, experiences: d.experiences.filter((_, idx) => idx !== i) }));

  const addSkill = () => setDb((d) => ({ ...d, skills: [...d.skills, "New Skill"] }));
  const updateSkill = (i: number, val: string) =>
    setDb((d) => ({ ...d, skills: d.skills.map((s, idx) => idx === i ? val : s) }));
  const removeSkill = (i: number) =>
    setDb((d) => ({ ...d, skills: d.skills.filter((_, idx) => idx !== i) }));

  const addFocus = () => setDb((d) => ({ ...d, focus_areas: [...d.focus_areas, "New Area"] }));
  const updateFocus = (i: number, val: string) =>
    setDb((d) => ({ ...d, focus_areas: d.focus_areas.map((f, idx) => idx === i ? val : f) }));
  const removeFocus = (i: number) =>
    setDb((d) => ({ ...d, focus_areas: d.focus_areas.filter((_, idx) => idx !== i) }));

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/20">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Content Editor</h1>
          <p className="text-xs text-muted font-mono uppercase tracking-wider mt-1">
            Edit every section of the site — auto-saves every 2s
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status !== "idle" && (
            <span className={`flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-full border ${
              status === "published" ? "bg-green-500/10 border-green-500/30 text-green-500" :
              status === "saved" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
              status === "error" ? "bg-red-500/10 border-red-500/30 text-red-500" :
              "bg-muted-light border-border text-muted"
            }`}>
              {status === "error" ? <AlertCircle className="h-3 w-3" /> :
               (status === "saving" || status === "publishing") ? <RefreshCw className="h-3 w-3 animate-spin" /> :
               <CheckCircle className="h-3 w-3" />}
              {statusMsg}
            </span>
          )}
          <button onClick={() => handleSave()} disabled={status === "saving"}
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs font-mono hover:text-foreground hover:bg-muted-light/40 transition-colors disabled:opacity-50">
            <Save className="h-3.5 w-3.5" /> Save Draft
          </button>
          <button onClick={handlePublish} disabled={status === "publishing"}
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-lg text-xs font-mono font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {status === "publishing" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
            Publish Live
          </button>
        </div>
      </div>

      {/* ── Site Info ── */}
      <SectionCard title="Site & Profile Info" icon={<User className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <Field label="Full Name">
            <input className={inputCls} value={db.site.name || ""} onChange={(e) => updateSite("name", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputCls} type="email" value={db.site.email || ""} onChange={(e) => updateSite("email", e.target.value)} />
          </Field>
          <Field label="Location">
            <input className={inputCls} value={db.site.location || ""} onChange={(e) => updateSite("location", e.target.value)} />
          </Field>
          <Field label="LinkedIn URL">
            <input className={inputCls} type="url" value={db.site.linkedin || ""} onChange={(e) => updateSite("linkedin", e.target.value)} />
          </Field>
          <Field label="GitHub URL">
            <input className={inputCls} type="url" value={db.site.github || ""} onChange={(e) => updateSite("github", e.target.value)} />
          </Field>
          <Field label="SEO Title">
            <input className={inputCls} value={db.site.seoTitle || ""} onChange={(e) => updateSite("seoTitle", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Headline">
              <input className={inputCls} value={db.site.headline || ""} onChange={(e) => updateSite("headline", e.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="SEO Description">
              <textarea className={textareaCls} rows={2} value={db.site.seoDescription || ""} onChange={(e) => updateSite("seoDescription", e.target.value)} />
            </Field>
          </div>
        </div>
      </SectionCard>

      {/* ── Hero ── */}
      <SectionCard title="Hero Section" icon={<Layers className="h-4 w-4" />}>
        <div className="flex flex-col gap-4 mt-3">
          <Field label="Badge Text">
            <input className={inputCls} value={db.hero.badge || ""} onChange={(e) => updateHero("badge", e.target.value)} />
          </Field>
          <Field label="Title (use [text] for animated highlight)">
            <input className={inputCls} value={db.hero.title || ""} onChange={(e) => updateHero("title", e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={textareaCls} rows={3} value={db.hero.description || ""} onChange={(e) => updateHero("description", e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Navigation ── */}
      <SectionCard title="Navigation Links" icon={<Navigation className="h-4 w-4" />}>
        <div className="flex flex-col gap-2 mt-3">
          {db.navigation.map((nav, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className={`${inputCls} flex-1`} value={nav.name} onChange={(e) => updateNavItem(i, "name", e.target.value)} placeholder="Label" />
              <input className={`${inputCls} flex-1`} value={nav.path} onChange={(e) => updateNavItem(i, "path", e.target.value)} placeholder="/path" />
              <button onClick={() => removeNavItem(i)} className="p-2 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button onClick={addNavItem} className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted hover:text-foreground hover:border-accent/40 transition-colors mt-1 w-fit">
            <Plus className="h-3.5 w-3.5" /> Add Link
          </button>
        </div>
      </SectionCard>

      {/* ── Popular Topics ── */}
      <SectionCard title="Popular Topics" icon={<Tag className="h-4 w-4" />}>
        <div className="flex flex-col gap-4 mt-3">
          {db.popular_topics.map((topic, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-background flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Topic {i + 1}</span>
                <button onClick={() => removeTopic(i)} className="p-1 text-muted hover:text-red-500 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Topic Name">
                  <input className={inputCls} value={topic.name} onChange={(e) => updateTopic(i, "name", e.target.value)} />
                </Field>
                <Field label="Count">
                  <input className={inputCls} type="number" value={topic.count} onChange={(e) => updateTopic(i, "count", Number(e.target.value))} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Description">
                    <textarea className={textareaCls} rows={2} value={topic.description} onChange={(e) => updateTopic(i, "description", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addTopic} className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted hover:text-foreground hover:border-accent/40 transition-colors w-fit">
            <Plus className="h-3.5 w-3.5" /> Add Topic
          </button>
        </div>
      </SectionCard>

      {/* ── Reading Collections ── */}
      <SectionCard title="Reading Collections" icon={<BookOpen className="h-4 w-4" />}>
        <div className="flex flex-col gap-4 mt-3">
          {db.reading_collections.map((col, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-background flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Collection {i + 1}</span>
                <button onClick={() => removeCollection(i)} className="p-1 text-muted hover:text-red-500 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Title">
                  <input className={inputCls} value={col.title} onChange={(e) => updateCollection(i, "title", e.target.value)} />
                </Field>
                <Field label="Slug">
                  <input className={inputCls} value={col.slug} onChange={(e) => updateCollection(i, "slug", e.target.value)} />
                </Field>
                <Field label="Article Count">
                  <input className={inputCls} type="number" value={col.count} onChange={(e) => updateCollection(i, "count", Number(e.target.value))} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Description">
                    <textarea className={textareaCls} rows={2} value={col.description} onChange={(e) => updateCollection(i, "description", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addCollection} className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted hover:text-foreground hover:border-accent/40 transition-colors w-fit">
            <Plus className="h-3.5 w-3.5" /> Add Collection
          </button>
        </div>
      </SectionCard>

      {/* ── Recent Notes ── */}
      <SectionCard title="Recent Notes" icon={<StickyNote className="h-4 w-4" />}>
        <div className="flex flex-col gap-4 mt-3">
          {db.recent_notes.map((note, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-background flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Note {i + 1}</span>
                <button onClick={() => removeNote(i)} className="p-1 text-muted hover:text-red-500 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <Field label="Date">
                <input className={inputCls} value={note.date} onChange={(e) => updateNote(i, "date", e.target.value)} placeholder="July 22, 2026" />
              </Field>
              <Field label="Note Content">
                <textarea className={textareaCls} rows={3} value={note.content} onChange={(e) => updateNote(i, "content", e.target.value)} placeholder="Your note..." />
              </Field>
            </div>
          ))}
          <button onClick={addNote} className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted hover:text-foreground hover:border-accent/40 transition-colors w-fit">
            <Plus className="h-3.5 w-3.5" /> Add Note
          </button>
        </div>
      </SectionCard>

      {/* ── Experiences ── */}
      <SectionCard title="Work Experience" icon={<Award className="h-4 w-4" />}>
        <div className="flex flex-col gap-4 mt-3">
          {db.experiences.map((exp, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-background flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Experience {i + 1}</span>
                <button onClick={() => removeExperience(i)} className="p-1 text-muted hover:text-red-500 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Role/Title">
                  <input className={inputCls} value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} />
                </Field>
                <Field label="Company/Organization">
                  <input className={inputCls} value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} />
                </Field>
                <Field label="Duration">
                  <input className={inputCls} value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} placeholder="July 2026 – Present" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Description">
                    <textarea className={textareaCls} rows={3} value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addExperience} className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-border rounded-lg text-xs text-muted hover:text-foreground hover:border-accent/40 transition-colors w-fit">
            <Plus className="h-3.5 w-3.5" /> Add Experience
          </button>
        </div>
      </SectionCard>

      {/* ── Education ── */}
      <SectionCard title="Education" icon={<GraduationCap className="h-4 w-4" />} defaultOpen={false}>
        <div className="flex flex-col gap-4 mt-3">
          {db.education.map((edu, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-background flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Institution">
                  <input className={inputCls} value={edu.institution} onChange={(e) =>
                    setDb((d) => ({ ...d, education: d.education.map((edu2, idx) => idx === i ? { ...edu2, institution: e.target.value } : edu2) }))} />
                </Field>
                <Field label="Degree">
                  <input className={inputCls} value={edu.degree} onChange={(e) =>
                    setDb((d) => ({ ...d, education: d.education.map((edu2, idx) => idx === i ? { ...edu2, degree: e.target.value } : edu2) }))} />
                </Field>
                <Field label="Duration">
                  <input className={inputCls} value={edu.duration} onChange={(e) =>
                    setDb((d) => ({ ...d, education: d.education.map((edu2, idx) => idx === i ? { ...edu2, duration: e.target.value } : edu2) }))} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Skills & Focus Areas ── */}
      <SectionCard title="Skills & Focus Areas" icon={<Layers className="h-4 w-4" />} defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
          {/* Skills */}
          <div>
            <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-3">Skills</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {db.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-1 px-2.5 py-1 bg-muted-light/30 border border-border rounded-full text-xs">
                  <input
                    className="bg-transparent border-none outline-none text-xs w-20"
                    value={skill}
                    onChange={(e) => updateSkill(i, e.target.value)}
                  />
                  <button onClick={() => removeSkill(i)} className="text-muted hover:text-red-500">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addSkill} className="flex items-center gap-1 px-2.5 py-1 border border-dashed border-border rounded-full text-xs text-muted hover:text-foreground hover:border-accent/40 transition-colors">
              <Plus className="h-3 w-3" /> Add Skill
            </button>
          </div>
          {/* Focus Areas */}
          <div>
            <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-3">Focus Areas</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {db.focus_areas.map((area, i) => (
                <div key={i} className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs">
                  <input
                    className="bg-transparent border-none outline-none text-xs w-24"
                    value={area}
                    onChange={(e) => updateFocus(i, e.target.value)}
                  />
                  <button onClick={() => removeFocus(i)} className="text-muted hover:text-red-500">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addFocus} className="flex items-center gap-1 px-2.5 py-1 border border-dashed border-border rounded-full text-xs text-muted hover:text-foreground hover:border-accent/40 transition-colors">
              <Plus className="h-3 w-3" /> Add Area
            </button>
          </div>
        </div>
        {/* Currently */}
        <div className="mt-4">
          <Field label="Currently (About page status)">
            <textarea className={textareaCls} rows={3} value={db.currently || ""} onChange={(e) => setDb((d) => ({ ...d, currently: e.target.value }))} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Quote of the Day ── */}
      <SectionCard title="Quote of the Day" icon={<QuoteIcon className="h-4 w-4" />} defaultOpen={false}>
        <div className="flex flex-col gap-4 mt-3">
          <Field label="Quote Text">
            <textarea className={textareaCls} rows={3} value={db.quote_of_the_day.text} onChange={(e) => updateQuote("text", e.target.value)} />
          </Field>
          <Field label="Author">
            <input className={inputCls} value={db.quote_of_the_day.author} onChange={(e) => updateQuote("author", e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Footer ── */}
      <SectionCard title="Footer" icon={<Globe className="h-4 w-4" />} defaultOpen={false}>
        <div className="flex flex-col gap-4 mt-3">
          <Field label="Copyright Text">
            <input className={inputCls} value={db.footer.copyright} onChange={(e) => updateFooter("copyright", e.target.value)} />
          </Field>
          <Field label="Footer Description">
            <textarea className={textareaCls} rows={2} value={db.footer.description} onChange={(e) => updateFooter("description", e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      {/* Bottom publish bar */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
        <button onClick={handlePublish} disabled={status === "publishing"}
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl text-sm font-semibold font-mono shadow-2xl hover:opacity-90 transition-opacity disabled:opacity-50">
          {status === "publishing" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          Publish All Changes Live
        </button>
      </div>
    </div>
  );
}
