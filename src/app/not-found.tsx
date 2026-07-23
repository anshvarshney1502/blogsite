"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground font-sans">
      {/* Tiny Header */}
      <header className="h-16 border-b border-border/40 flex items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-xs tracking-tight hover:opacity-80 transition-opacity"
        >
          <Terminal className="h-4 w-4 text-accent" />
          <span className="font-semibold">ANSH VARSHNEY</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
        <span className="font-mono text-xs text-accent uppercase tracking-widest block mb-4">
          Error Code / 404
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-semibold leading-tight mb-4">
          Page not found.
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono text-muted hover:text-foreground bg-muted-light hover:bg-border/60 border border-border rounded-lg transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Index</span>
          <kbd className="hidden sm:inline-block ml-2 text-[9px] bg-background border border-border/80 px-1 rounded">
            ESC
          </kbd>
        </Link>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 bg-muted-light/10 text-center font-mono text-[10px] text-muted">
        © {new Date().getFullYear()} Ansh Varshney. Verified routing layer.
      </footer>
    </div>
  );
}
