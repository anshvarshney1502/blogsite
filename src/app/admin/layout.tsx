"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal, LayoutDashboard, Settings as SettingsIcon, LogOut, Menu, X, Image as ImageIcon, LayoutTemplate, FileText, BarChart3, PenLine, Edit3 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard",      path: "/admin",           icon: LayoutDashboard },
    { name: "Articles",       path: "/admin",           icon: FileText },
    { name: "Content Editor", path: "/admin/content",   icon: Edit3 },
    { name: "Page Builder",   path: "/admin/pages",     icon: PenLine },
    { name: "Media Library",  path: "/admin/media",     icon: ImageIcon },
    { name: "Homepage",       path: "/admin/homepage",  icon: LayoutTemplate },
    { name: "Analytics",      path: "/admin/analytics", icon: BarChart3 },
    { name: "Settings",       path: "/admin/settings",  icon: SettingsIcon },
  ];


  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch {
      alert("Unable to logout.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-border/60 bg-muted-light/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-border/40 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs font-semibold tracking-wider">ADMIN CONTROL</span>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1 text-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-colors active-tactile ${
                  isActive 
                    ? "bg-accent/10 text-accent font-semibold border border-accent/20" 
                    : "text-muted hover:text-foreground hover:bg-muted-light/40 border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-border/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono text-muted hover:text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer active-tactile text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <header className="h-16 px-6 border-b border-border/40 flex items-center justify-between bg-background">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-muted hover:text-foreground cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <span className="font-mono text-[10px] text-muted bg-muted-light px-2 py-1 rounded border border-border/80">
              ROLE: ADMIN
            </span>
          </div>
        </header>

        {/* Content canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
