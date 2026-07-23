"use client";

import React, { useState } from "react";
import Navigation from "@/components/navigation";
import CommandMenu from "@/components/command-menu";
import Link from "next/link";
import { ArrowUpRight, Cpu, BookOpen, Layers, MessageSquare, Quote, ArrowRight } from "lucide-react";
import { PostMetadata } from "@/lib/mdx";
import { DbSchema } from "@/lib/db";
import ScrollRevealSection from "@/components/scroll-reveal-section";

interface HomeClientProps {
  initialPosts: PostMetadata[];
  db: DbSchema;
}

export default function HomeClient({ initialPosts, db }: HomeClientProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const POPULAR_TOPICS = db.popular_topics;
  const READING_COLLECTIONS = db.reading_collections;
  const RECENT_NOTES = db.recent_notes;

  const featuredEssay = initialPosts.find(a => a.featured) || initialPosts[0];
  const latestWritings = initialPosts.filter(a => a.slug !== featuredEssay?.slug);

  // Read homepage section configurations dynamically
  const sections = db.homepage_sections || [
    { id: "hero", type: "hero", visible: true, order: 0, data: db.hero },
    { id: "latest-writings", type: "latest_writings", visible: true, order: 1, data: { sectionNumber: "01", heading: "Recent Writings", subheading: "Fresh technical notes and reflections published weekly." } },
    { id: "featured-essay", type: "featured_essay", visible: true, order: 2, data: { sectionNumber: "02", heading: "Featured System Study" } },
    { id: "popular-topics", type: "popular_topics", visible: true, order: 3, data: { sectionNumber: "03" } },
    { id: "reading-collections", type: "reading_collections", visible: true, order: 4, data: { sectionNumber: "04", heading: "Reading Collections" } },
    { id: "recent-notes", type: "recent_notes", visible: true, order: 5, data: { sectionNumber: "05", heading: "Recent Notes", subheading: "Raw logs, digital gardening, and systems observation." } },
    { id: "quote", type: "quote", visible: true, order: 6, data: {} }
  ];

  // Sort sections by order metadata
  const sortedSections = [...sections]
    .filter(s => s.visible)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const renderSection = (section: typeof sections[0]) => {
    switch (section.type) {
      case "hero": {
        const badge = section.data?.badge || "TECHNICAL JOURNAL";
        const title = section.data?.title || "Thoughts on [Artificial Intelligence], Python, system design, and software engineering.";
        const description = section.data?.description || "";
        return (
          <section
            key={section.id}
            className="py-24 md:py-32 border-b border-border/20"
          >
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-muted">{badge}</span>
              </div>
              <h1 className="font-serif text-4xl md:text-6xl font-normal leading-[1.1] tracking-tight text-foreground mb-8">
                {title.split("[").map((part: string, index: number) => {
                  if (part.includes("]")) {
                    const [highlighted, normal] = part.split("]");
                    return (
                      <React.Fragment key={index}>
                        <span className="italic font-light text-muted">{highlighted}</span>
                        {normal}
                      </React.Fragment>
                    );
                  }
                  return part;
                })}
              </h1>
              <p className="text-base md:text-xl text-muted leading-relaxed font-sans max-w-2xl">
                {description}
              </p>
            </div>
          </section>
        );
      }

      case "latest_writings": {
        const num = section.data?.sectionNumber || "01";
        const head = section.data?.heading || "Recent Writings";
        const sub = section.data?.subheading || "Fresh technical notes and reflections published weekly.";
        return (
          <section key={section.id} className="py-20 md:py-28 border-b border-border/20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted block mb-4">{num} / LATEST EDITIONS</span>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">{head}</h2>
                  <p className="text-xs text-muted mt-2 font-sans max-w-[200px]">{sub}</p>
                </div>
              </div>
              <div className="lg:col-span-3 flex flex-col gap-12">
                {latestWritings.map((article) => (
                  <Link key={article.slug} href={`/writings/${article.slug}`} className="group block active-tactile">
                    <div className="flex flex-col md:flex-row justify-between gap-4 md:items-baseline pb-8 border-b border-border/20 group-last:border-0 group-last:pb-0 hover:translate-x-0.5 transition-transform duration-300">
                      <div className="max-w-xl">
                        <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-2">
                          {article.tags?.[0] || article.category}
                        </span>
                        <h3 className="font-serif text-xl md:text-2xl font-medium text-foreground group-hover:text-accent transition-colors flex items-start gap-1">
                          <span className="link-premium">{article.title}</span>
                          <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-accent mt-1 shrink-0" />
                        </h3>
                        <p className="text-sm text-muted mt-3 leading-relaxed">{article.description}</p>
                      </div>
                      <div className="font-mono text-xs text-muted shrink-0 flex items-center gap-2">
                        <span>{article.date}</span>
                        <span>•</span>
                        <span>{article.readingTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "featured_essay": {
        const num = section.data?.sectionNumber || "02";
        const head = section.data?.heading || "Featured System Study";
        if (!featuredEssay) return null;
        return (
          <section key={section.id} className="py-20 md:py-28 border-b border-border/20">
            <div className="flex flex-col gap-6 mb-8">
              <span className="font-mono text-xs uppercase tracking-widest text-muted">{num} / MASTERPIECE ESSAY</span>
              <div className="flex items-baseline gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                <h2 className="font-serif text-3xl font-semibold text-foreground">{head}</h2>
              </div>
            </div>
            <Link href={`/writings/${featuredEssay.slug}`} className="group block">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-8 md:p-12 rounded-xl border border-border bg-muted-light/10 hover:bg-muted-light/20 transition-all duration-300">
                <div className="lg:col-span-3 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs text-muted uppercase tracking-wider block mb-4">{featuredEssay.category} • {featuredEssay.readingTime}</span>
                    <h3 className="font-serif text-2xl md:text-4xl font-semibold leading-tight text-foreground mb-4 group-hover:text-accent transition-colors">
                      {featuredEssay.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted leading-relaxed mb-8">
                      {featuredEssay.description}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-foreground font-semibold flex items-center gap-1.5 group-hover:text-accent transition-colors">
                    Read core investigation <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
                <div className="hidden lg:col-span-2 lg:flex flex-col justify-center border-l border-border/60 pl-8 font-mono text-xs text-muted/80">
                  <div className="flex items-center gap-2 text-foreground font-semibold mb-4">
                    <Cpu className="h-4 w-4 text-accent" />
                    <span>ENGINE TOPOLOGY</span>
                  </div>
                  <p className="mb-4 leading-relaxed">A visual inspection of consensus log reconciliation under network partitioning constraints.</p>
                  <div className="bg-background border border-border p-4 rounded text-[10px] leading-relaxed text-muted font-mono w-full">
                    <div>term: 12</div>
                    <div>commit_index: 382</div>
                    <div>peers: [10.0.1.1, 10.0.1.2]</div>
                    <div className="text-green-500">{"// Heartbeat safe"}</div>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        );
      }

      case "popular_topics": {
        const num = section.data?.sectionNumber || "03";
        return (
          <section key={section.id} className="py-20 md:py-28 border-b border-border/20">
            <span className="font-mono text-xs uppercase tracking-widest text-muted block mb-12">{num} / CONTEXT DIRECTORIES</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {POPULAR_TOPICS.map((topic, i) => (
                <div key={topic.name} style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties} className="reveal reveal-visible flex flex-col justify-between p-6 rounded-lg border border-border/60 bg-background">
                  <div>
                    <div className="flex items-baseline justify-between mb-4 border-b border-border/20 pb-2">
                      <span className="font-serif text-lg font-medium text-foreground">{topic.name}</span>
                      <span className="font-mono text-xs text-muted">{topic.count}</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{topic.description}</p>
                  </div>
                  <div className="text-[10px] font-mono text-accent mt-6 hover:underline cursor-pointer flex items-center gap-1">
                    <span>Browse articles</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case "reading_collections": {
        const num = section.data?.sectionNumber || "04";
        const head = section.data?.heading || "Reading Collections";
        return (
          <section key={section.id} className="py-20 md:py-28 border-b border-border/20">
            <div className="flex flex-col mb-12">
              <span className="font-mono text-xs uppercase tracking-widest text-muted block mb-4">{num} / THEMATIC SYLLABI</span>
              <div className="flex items-baseline gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <h2 className="font-serif text-3xl font-semibold text-foreground">{head}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {READING_COLLECTIONS.map((col, i) => (
                <div key={col.title} style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties} className="reveal reveal-visible group relative flex flex-col justify-between p-6 rounded-lg border border-border bg-background hover:bg-muted-light/10 transition-colors cursor-pointer">
                  <div>
                    <span className="font-mono text-[10px] text-muted tracking-wider block mb-2">{col.count} Essays</span>
                    <h3 className="font-serif text-xl font-medium text-foreground group-hover:text-accent transition-colors mb-3">{col.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{col.description}</p>
                  </div>
                  <div className="text-xs font-mono font-medium text-foreground/80 mt-6 flex items-center gap-1 group-hover:text-accent transition-colors">
                    <span>Explore Syllabus</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }

      case "recent_notes": {
        const num = section.data?.sectionNumber || "05";
        const head = section.data?.heading || "Recent Notes";
        const sub = section.data?.subheading || "Raw logs, digital gardening, and systems observation.";
        return (
          <section key={section.id} className="py-20 md:py-28 border-b border-border/20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted block mb-4">{num} / BRAIN DUMPS</span>
                  <div className="flex items-baseline gap-2">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    <h2 className="font-serif text-2xl font-semibold text-foreground">{head}</h2>
                  </div>
                  <p className="text-xs text-muted mt-2 leading-relaxed">{sub}</p>
                </div>
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                {RECENT_NOTES.map((note, i) => (
                  <div key={note.id} style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties} className="reveal reveal-visible p-5 rounded-lg border border-border/40 hover:border-border bg-muted-light/10 hover:bg-muted-light/20 font-mono text-[11px] text-muted leading-relaxed flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-all duration-500 ease-out">
                    <p className="mb-4">&ldquo;{note.content}&rdquo;</p>
                    <span className="text-[10px] opacity-60 block mt-auto">{note.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "quote": {
        if (!db.quote_of_the_day) return null;
        return (
          <section key={section.id} className="py-20 md:py-28 border-b border-border/20">
            <div className="mx-auto max-w-2xl text-center">
              <Quote className="h-6 w-6 text-accent/40 mx-auto mb-6" />
              <blockquote className="font-serif italic text-xl md:text-2xl text-foreground leading-relaxed mb-4">
                &ldquo;{db.quote_of_the_day.text}&rdquo;
              </blockquote>
              <cite className="font-mono text-xs text-muted block">— {db.quote_of_the_day.author}</cite>
            </div>
          </section>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      <Navigation onSearchClick={() => setIsCommandOpen(true)} />
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Grid line effect wrapper */}
      <div className="mx-auto max-w-5xl px-6 w-full flex-grow">
        {sortedSections.map((section, index) => (
          <ScrollRevealSection key={section.id} delay={index * 120}>
            {renderSection(section)}
          </ScrollRevealSection>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-border/20 py-12 bg-muted-light/10">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8 font-mono text-xs text-muted">
          <div className="md:col-span-2">
            <span className="font-semibold text-foreground block mb-3">{db.site.name.toUpperCase()}</span>
            <p className="text-[11px] leading-relaxed max-w-xs">{db.footer.description}</p>
          </div>
          <div>
            <span className="font-semibold text-foreground block mb-3">SECTIONS</span>
            <div className="flex flex-col gap-2">
              <Link href="/" className="hover:text-foreground">Journal Index</Link>
              <Link href="/archive" className="hover:text-foreground">Archive Index</Link>
              <Link href="/about" className="hover:text-foreground">About & CV</Link>
            </div>
          </div>
          <div>
            <span className="font-semibold text-foreground block mb-3">COMMANDS</span>
            <div className="flex flex-col gap-2">
              <button onClick={() => setIsCommandOpen(true)} className="text-left hover:text-foreground cursor-pointer">Command Center (⌘K)</button>
              <a href="/feed.xml" className="hover:text-foreground">RSS Feed</a>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-6 border-t border-border/20 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-[10px] text-muted">
          <span>{db.footer.copyright.replace("2026", new Date().getFullYear().toString())}</span>
          <span>Version 1.0.0 (Production)</span>
        </div>
      </footer>
    </>
  );
}
