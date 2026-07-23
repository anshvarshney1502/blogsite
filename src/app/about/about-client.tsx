"use client";

import React, { useState } from "react";
import Navigation from "@/components/navigation";
import CommandMenu from "@/components/command-menu";
import { ArrowUpRight, BookOpen, MapPin, Cpu, Flame, Code } from "lucide-react";
import { DbSchema } from "@/lib/db";
import ScrollRevealSection from "@/components/scroll-reveal-section";

interface AboutClientProps {
  db: DbSchema;
}

export default function AboutClient({ db }: AboutClientProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const experiences = db.experiences;
  const technologies = db.skills;
  const focusAreas = db.focus_areas;

  return (
    <>
      <Navigation onSearchClick={() => setIsCommandOpen(true)} />
      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Main Container featuring an asymmetrical luxury editorial grid layout */}
      <main className="mx-auto max-w-5xl px-6 py-28 md:py-44 w-full flex-grow flex flex-col gap-36">
        
        {/* Dynamic Header Block with Large Accent Initials */}
        <ScrollRevealSection delay={100}>
          <div className="relative flex flex-col lg:flex-row gap-12 items-start justify-between border-b border-border/20 pb-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-[1px] w-8 bg-accent" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                  CHRONICLE & ARCHIVE
                </span>
              </div>
              
              <h1 className="font-serif text-6xl md:text-8.5xl font-light leading-[0.95] tracking-tight text-foreground">
                Designing <br />
                <span className="font-serif italic font-extralight text-muted">intelligent</span> <br />
                systems.
              </h1>
            </div>

            <div className="lg:w-80 shrink-0 font-mono text-xs text-muted leading-relaxed flex flex-col gap-6 pt-4 lg:pt-16 border-t lg:border-t-0 lg:border-l border-border/20 lg:pl-8">
              <div>
                <span className="text-foreground font-semibold block mb-1">LOCALIZATION</span>
                <span className="flex items-center gap-1.5 text-foreground/90"><MapPin className="h-3.5 w-3.5 text-accent" /> {db.site.location}</span>
              </div>
              <div>
                <span className="text-foreground font-semibold block mb-1">ACADEMIC BASE</span>
                <span className="flex items-center gap-1.5 text-foreground/90"><BookOpen className="h-3.5 w-3.5 text-accent" /> {db.education[0]?.degree}</span>
              </div>
            </div>
          </div>
        </ScrollRevealSection>

        {/* Narrative Split Column Layout */}
        <ScrollRevealSection delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-foreground font-semibold block">BIOGRAPHY</span>
            </div>
            <div className="lg:col-span-8 flex flex-col gap-6 text-lg md:text-xl text-muted leading-relaxed font-sans font-light">
              <p>
                I am <span className="text-foreground font-normal">{db.site.name}</span>. I build public software systems, with a particular focus on distributed networks, WebGL simulations, and systems runtime optimization.
              </p>
              <p className="text-base text-muted/90 leading-relaxed font-normal">
                This space serves as a transparent log. I publish technical reviews, source code walk-throughs, and dynamic design templates. Rather than curating completed benchmarks, I document the bugs, compilation errors, and development cycles that shape system development.
              </p>
            </div>
          </div>
        </ScrollRevealSection>

        {/* Intersecting Slash manifesto */}
        <ScrollRevealSection delay={250}>
          <div className="relative py-20 border-y border-border/20 flex flex-col gap-6">
            <span className="font-mono text-xs uppercase tracking-widest text-muted block">CORE VALUES</span>
            <div className="font-serif text-3xl md:text-5xl text-foreground font-light leading-snug tracking-tight max-w-4xl">
              I believe the best way to learn is to <span className="italic font-light text-muted">build publicly</span>. Every project teaches something. Every bug teaches something. Every article helps organize my thinking.
            </div>
          </div>
        </ScrollRevealSection>

        {/* Dynamic Timeline Grid - Asymmetric Layout */}
        <ScrollRevealSection delay={300}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-foreground font-semibold block mb-3">01 / BACKGROUND</span>
              <h2 className="font-serif text-3xl font-normal text-foreground">Timeline</h2>
              <p className="text-sm text-muted leading-relaxed mt-2 max-w-[180px] font-sans">
                Professional history, technical roles, and code contributions.
              </p>
            </div>
            <div className="lg:col-span-8 flex flex-col gap-16">
              {experiences.map((exp, idx) => (
                <div key={idx} className="relative group">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
                    <h3 className="font-serif text-2xl font-normal text-foreground hover:text-accent transition-colors duration-300">
                      {exp.role}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-muted">
                      <span className="font-semibold text-foreground/80">{exp.company}</span>
                      <span className="text-border/60">•</span>
                      <span>{exp.duration}</span>
                    </div>
                  </div>
                  <p className="text-base text-muted leading-relaxed font-sans font-light">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollRevealSection>

        {/* Clean Line-separated Skills and Expertise */}
        <ScrollRevealSection delay={400}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-foreground font-semibold block mb-3">02 / EXPERTISE</span>
              <h2 className="font-serif text-3xl font-normal text-foreground">Tech Stack</h2>
              <p className="text-sm text-muted leading-relaxed mt-2 max-w-[180px] font-sans">
                Primary languages, framework tools, and core system architectures.
              </p>
            </div>
            <div className="lg:col-span-8 flex flex-col gap-12">
              <div>
                <span className="flex items-center gap-1.5 font-mono text-xs text-accent uppercase tracking-widest mb-6">
                  <Code className="h-4 w-4" /> Focus Areas
                </span>
                <div className="flex flex-wrap gap-x-8 gap-y-4 font-serif text-2xl text-muted/70">
                  {focusAreas.map((area, i) => (
                    <span key={area} className="hover:text-foreground transition-colors cursor-default duration-300">
                      {area}{i < focusAreas.length - 1 && <span className="text-border/40 font-mono text-xs ml-8">/</span>}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-border/20 pt-8">
                <span className="flex items-center gap-1.5 font-mono text-xs text-accent uppercase tracking-widest mb-6">
                  <Cpu className="h-4 w-4" /> Core Technologies
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 font-mono text-sm text-muted">
                  {technologies.map((tech) => (
                    <span key={tech} className="hover:text-foreground transition-colors duration-300 cursor-default flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-accent/65 rounded-full" />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollRevealSection>

        {/* Bottom Current Focus Segment */}
        <ScrollRevealSection delay={500}>
          <div className="border-t border-border/20 pt-16 flex flex-col lg:flex-row gap-12 justify-between items-start">
            <div className="max-w-xl">
              <span className="flex items-center gap-1.5 font-mono text-xs text-accent uppercase tracking-widest mb-4">
                <Flame className="h-4 w-4 text-orange-500 animate-pulse" /> ACTIVE EXPERIMENTATION
              </span>
              <p className="text-base text-muted leading-relaxed font-sans font-light">
                {db.currently}
              </p>
            </div>
            
            <div className="flex flex-col gap-3 shrink-0">
              <span className="font-mono text-xs uppercase tracking-widest text-muted">CORRESPONDENCE</span>
              <a
                href={`mailto:${db.site.email}`}
                className="inline-flex items-center gap-2 text-base font-sans font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                <span>Email Correspondence</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </ScrollRevealSection>
      </main>

      <footer className="border-t border-border/40 py-12 bg-muted-light/10">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row justify-between items-center gap-6 font-mono text-xs text-muted">
          <div>{db.footer.copyright.replace("2026", new Date().getFullYear().toString())}</div>
          <div className="flex gap-4">
            <a href={db.site.github} target="_blank" className="hover:text-foreground transition-colors flex items-center gap-1">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
              </svg>
              <span>GitHub</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
