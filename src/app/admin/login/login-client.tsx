"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, KeyRound, AlertCircle } from "lucide-react";

export default function LoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch {
      setError("Unable to connect to login server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm p-8 rounded-xl border border-border bg-muted-light/10 shadow-[0_8px_30px_rgba(0,0,0,0.01)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
            <Terminal className="h-5 w-5 text-accent animate-pulse" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Admin Portal</h1>
          <p className="text-xs text-muted mt-1.5 font-mono">AUTHORIZED PERSONNEL ONLY</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 mb-6 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Username</label>
            <input
              type="text"
              required
              disabled={loading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="admin"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-muted uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-foreground text-background font-mono text-xs font-semibold rounded-lg hover:opacity-90 active-tactile transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>{loading ? "Authenticating..." : "Access Dashboard"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
