"use client";

import React, { useState, useEffect } from "react";
import { Settings, Cpu, Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface SiteConfig {
  name: string;
  email: string;
  headline: string;
  location: string;
  linkedin: string;
  github: string;
}

interface FooterConfig {
  description: string;
  copyright: string;
}

export default function SettingsClient() {
  const [site, setSite] = useState<SiteConfig>({
    name: "",
    email: "",
    headline: "",
    location: "",
    linkedin: "",
    github: "",
  });
  const [currently, setCurrently] = useState("");
  const [footer, setFooter] = useState<FooterConfig>({
    description: "",
    copyright: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.site) setSite(data.site);
          if (data.footer) {
            setFooter({
              description: data.footer.description || "",
              copyright: data.footer.copyright || "",
            });
          }
          setCurrently(data.currently || data.footer?.currently || "");
        }
      } catch {
        setError("Failed to load configurations");
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, currently, footer }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Failed to save configuration settings");
      }
    } catch {
      setError("Network error: Unable to update configurations");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 font-mono text-xs text-muted">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading configurations...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/20">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Global Site Settings</h1>
          <p className="text-xs text-muted font-mono uppercase tracking-wider mt-1">Dynamic configuration panels</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-mono text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50 active-tactile"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save & Publish"}
        </button>
      </div>

      {/* Notification banners */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl font-mono text-xs text-green-500">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Configurations updated and published successfully!</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl font-mono text-xs text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <div className="p-6 rounded-xl border border-border bg-muted-light/10 flex flex-col gap-4">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-accent" />
            <span>Profile Configuration</span>
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Author Name</label>
            <input
              type="text"
              required
              value={site.name}
              onChange={(e) => setSite({ ...site, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Contact Email</label>
            <input
              type="email"
              required
              value={site.email}
              onChange={(e) => setSite({ ...site, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Site Location</label>
            <input
              type="text"
              required
              value={site.location}
              onChange={(e) => setSite({ ...site, location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Headline Summary</label>
            <textarea
              required
              value={site.headline}
              onChange={(e) => setSite({ ...site, headline: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>
        </div>

        {/* Directory Links & footer info */}
        <div className="p-6 rounded-xl border border-border bg-muted-light/10 flex flex-col gap-4">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-accent" />
            <span>Socials & Footer Settings</span>
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">LinkedIn URL</label>
            <input
              type="url"
              required
              value={site.linkedin}
              onChange={(e) => setSite({ ...site, linkedin: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">GitHub Profile URL</label>
            <input
              type="url"
              required
              value={site.github}
              onChange={(e) => setSite({ ...site, github: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Currently (Focus Statement)</label>
            <input
              type="text"
              required
              value={currently}
              onChange={(e) => setCurrently(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Footer Short Description</label>
            <input
              type="text"
              required
              value={footer.description}
              onChange={(e) => setFooter({ ...footer, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
