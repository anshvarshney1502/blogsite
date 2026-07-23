"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Eye, Clock, TrendingUp, RefreshCw, FileText } from "lucide-react";

interface AnalyticsData {
  totalViews: number;
  viewsBySlug: Record<string, number>;
  events: Array<{
    type: string;
    slug: string;
    timestamp: string;
  }>;
}

export default function AnalyticsDashboardClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/stats");
      if (res.ok) {
        const stats = await res.json();
        setData(stats);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 font-mono text-xs text-muted">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading analytics data...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 font-mono text-xs text-muted">
        Unable to load analytics stats.
      </div>
    );
  }

  const topPosts = Object.entries(data.viewsBySlug || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalViews = data.totalViews || 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border/20">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Analytics</h1>
          <p className="font-mono text-xs text-muted mt-1">Real-time performance and view stats</p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 border border-border rounded-lg text-muted hover:text-foreground hover:bg-muted-light/40 transition-colors cursor-pointer active-tactile"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-border bg-background flex flex-col gap-2">
          <div className="flex justify-between items-center text-muted font-mono text-xs">
            <span>TOTAL VIEWS</span>
            <Eye className="h-4 w-4" />
          </div>
          <span className="font-serif text-4xl font-bold text-foreground mt-1">{totalViews}</span>
          <p className="text-[10px] text-muted font-mono mt-2 flex items-center gap-1 text-green-500">
            <TrendingUp className="h-3 w-3" /> Live traffic monitoring active
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-background flex flex-col gap-2">
          <div className="flex justify-between items-center text-muted font-mono text-xs">
            <span>TRACKED ARTICLES</span>
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-serif text-4xl font-bold text-foreground mt-1">
            {Object.keys(data.viewsBySlug || {}).length}
          </span>
          <p className="text-[10px] text-muted font-mono mt-2">Active items in reading index</p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-background flex flex-col gap-2">
          <div className="flex justify-between items-center text-muted font-mono text-xs">
            <span>REAL-TIME STREAM</span>
            <Clock className="h-4 w-4" />
          </div>
          <span className="font-serif text-4xl font-bold text-foreground mt-1">
            {data.events?.length || 0}
          </span>
          <p className="text-[10px] text-muted font-mono mt-2">Total events log history count</p>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Articles */}
        <div className="border border-border rounded-xl p-6 bg-background flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <BarChart3 className="h-4 w-4 text-accent" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Top Writings</h2>
          </div>
          <div className="flex flex-col gap-3">
            {topPosts.length === 0 ? (
              <p className="font-mono text-xs text-muted text-center py-6">No view stats recorded yet.</p>
            ) : (
              topPosts.map(([slug, count], i) => (
                <div key={slug} className="flex justify-between items-center font-mono text-xs py-2 border-b border-border/10 last:border-0">
                  <div className="flex items-center gap-3 truncate pr-4">
                    <span className="text-muted text-[10px] w-4">{i + 1}.</span>
                    <span className="text-foreground truncate font-serif font-semibold">{slug}</span>
                  </div>
                  <span className="bg-muted-light/60 px-2 py-0.5 border border-border/80 rounded font-semibold text-muted text-[10px] shrink-0">
                    {count} views
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="border border-border rounded-xl p-6 bg-background flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <Clock className="h-4 w-4 text-accent" />
            <h2 className="font-serif text-lg font-semibold text-foreground">Live Logs Feed</h2>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[260px] pr-2">
            {!data.events || data.events.length === 0 ? (
              <p className="font-mono text-xs text-muted text-center py-6">No event stream logs recorded.</p>
            ) : (
              [...data.events].reverse().slice(0, 15).map((e, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 py-1.5 border-b border-border/10 last:border-0 font-mono text-[10px]">
                  <span className="text-foreground truncate pr-2 max-w-[280px]">
                    👁 View on <strong className="font-serif font-semibold text-accent">{e.slug}</strong>
                  </span>
                  <span className="text-muted text-[9px]">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
