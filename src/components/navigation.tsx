"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Terminal, Search as SearchIcon } from "lucide-react";
import { motion } from "framer-motion";
import db from "../../content/db.json";

interface NavigationProps {
  onSearchClick?: () => void;
  scrollProgress?: number;
}

export default function Navigation({ onSearchClick, scrollProgress }: NavigationProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Sync initial theme
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  const navItems = db.navigation;

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-500 ease-in-out ${
        scrolled
          ? "h-12 border-b border-border/40 bg-background/85 backdrop-blur-md"
          : "h-16 border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-5xl px-6 h-full flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-xs tracking-tight hover:opacity-80 transition-opacity"
          aria-label={`${db.site.name} Home`}
        >
          <Terminal className="h-4 w-4 text-accent" />
          <span className="font-semibold hidden sm:inline-block">{db.site.name.toUpperCase()}</span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 md:gap-2" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                href={item.path}
                className="relative px-2.5 py-1 text-xs md:text-sm font-medium text-muted hover:text-foreground transition-colors rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 bg-muted-light/40 border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.01)] rounded-md -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                {item.name}
              </Link>
            );
          })}
          
          {/* Search Trigger */}
          <button
            onClick={onSearchClick}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs md:text-sm font-medium text-muted hover:text-foreground rounded-md focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer active-tactile"
            aria-label="Open Search Command Palette"
          >
            <SearchIcon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden lg:inline-block text-[9px] bg-muted-light border border-border/80 px-1 rounded font-mono">
              ⌘K
            </kbd>
          </button>
        </nav>

        {/* Theme Toggle & Command Action */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-1.5 text-muted hover:text-foreground rounded-md hover:bg-muted-light transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent active-tactile"
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {scrollProgress !== undefined && scrollProgress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-border/20">
          <motion.div
            className="h-full bg-accent origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: scrollProgress / 100 }}
            transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.5 }}
          />
        </div>
      )}
    </header>
  );
}
