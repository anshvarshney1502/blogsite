"use client";

import React, { useEffect, useState } from "react";
import { Copy, Check, Terminal, AlertCircle, AlertTriangle, Info, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import katex from "katex";
import "katex/dist/katex.min.css";

// Dynamic Mermaid loader to avoid server-side hydration mismatches
function MermaidRenderer({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    import("mermaid").then((m) => {
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        fontFamily: "var(--font-geist-mono)",
      });

      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(id, chart)
        .then(({ svg }) => {
          if (active) setSvg(svg);
        })
        .catch(() => {
          if (active) setError(true);
        });
    });

    return () => {
      active = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 rounded font-mono text-xs my-4">
        Failed to render Mermaid diagram.
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="h-32 flex items-center justify-center border border-border/60 bg-muted-light/10 rounded font-mono text-xs text-muted my-4">
        Loading diagram...
      </div>
    );
  }

  return (
    <div
      className="my-6 flex justify-center overflow-x-auto p-4 border border-border/60 bg-muted-light/10 rounded-lg"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// GitHub Gist Embed
function GistRenderer({ id }: { id: string }) {
  const [gistData, setGistData] = useState<string>("");

  useEffect(() => {
    // Load Gist raw file data or embed mock
    setGistData(`// GitHub Gist Embed (Ref: github.com/${id})\n// Loading live gist frame...`);
  }, [id]);

  return (
    <div className="my-6 border border-border rounded-lg bg-muted-light/40 overflow-hidden">
      <div className="px-4 py-2 border-b border-border/80 bg-muted-light/80 flex justify-between items-center font-mono text-[10px] text-muted">
        <span>Gist: {id}</span>
        <a
          href={`https://gist.github.com/${id}`}
          target="_blank"
          className="hover:underline"
        >
          View raw
        </a>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs text-muted leading-relaxed">
        <code>{gistData}</code>
      </pre>
    </div>
  );
}

// YouTube Embed Component
function YouTubeRenderer({ id }: { id: string }) {
  return (
    <div className="my-8 aspect-[16/9] w-full border border-border/80 rounded-xl overflow-hidden bg-black shadow-lg">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube Video Embed"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
}

// Copy Code Helper Component
function CodeRenderer({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group overflow-hidden rounded-lg border border-border bg-muted-light/40 my-6">
      <div className="flex justify-between items-center px-4 py-2 bg-muted-light/60 border-b border-border/80 font-mono text-[10px] text-muted">
        <span className="flex items-center gap-1.5 font-semibold text-foreground/80">
          <Terminal className="h-3.5 w-3.5 text-accent" />
          {language.toUpperCase()}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer active-tactile"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-1 text-green-500 font-medium"
              >
                <Check className="h-3 w-3" />
                <span>Copied</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 2 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Parse custom Admonitions/Callouts (:::info ... :::)
function CalloutRenderer({ type, content }: { type: string; content: string }) {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    danger: AlertCircle,
    tip: HelpCircle,
  };
  const Icon = icons[type as keyof typeof icons] || Info;

  const styles = {
    info: "border-blue-500/20 bg-blue-500/5 text-blue-900 dark:text-blue-100",
    warning: "border-yellow-500/20 bg-yellow-500/5 text-yellow-900 dark:text-yellow-100",
    danger: "border-red-500/20 bg-red-500/5 text-red-900 dark:text-red-100",
    tip: "border-green-500/20 bg-green-500/5 text-green-900 dark:text-green-100",
  };
  const borderStyle = styles[type as keyof typeof styles] || styles.info;

  return (
    <div className={`my-6 flex gap-4 p-4 border rounded-xl leading-relaxed text-sm ${borderStyle}`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-grow prose-sm dark:prose-invert font-sans">
        {content}
      </div>
    </div>
  );
}

// Simple React Parser to dynamically convert MDX tokens
export function MDXContentRenderer({ content }: { content: string }) {
  const [rendered, setRendered] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // Basic Markdown Line parser that supports math blocks, gists, youtube embeds, and custom callouts.
    const blocks: React.ReactNode[] = [];
    const lines = content.split("\n");
    let currentParagraph = "";
    let codeBlockContent = "";
    let codeBlockLang = "";
    let isCodeBlock = false;
    let calloutContent = "";
    let calloutType = "";
    let isCallout = false;

    const flushParagraph = (key: number) => {
      if (currentParagraph.trim()) {
        // Parse Math inline $ ... $
        const text = currentParagraph;
        const inlineMathRegex = /\$([^$]+)\$/g;
        let match;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        while ((match = inlineMathRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
          }
          try {
            const mathHtml = katex.renderToString(match[1], { displayMode: false });
            parts.push(
              <span
                key={`math-${match.index}`}
                dangerouslySetInnerHTML={{ __html: mathHtml }}
              />
            );
          } catch {
            parts.push(match[0]);
          }
          lastIndex = inlineMathRegex.lastIndex;
        }

        if (lastIndex < text.length) {
          parts.push(text.substring(lastIndex));
        }

        blocks.push(
          <p key={`p-${key}`} className="mb-6 leading-relaxed text-muted">
            {parts.length > 0 ? parts : text}
          </p>
        );
        currentParagraph = "";
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle Code Block
      if (line.trim().startsWith("```")) {
        if (isCodeBlock) {
          // Flush Code Block
          if (codeBlockLang === "mermaid") {
            blocks.push(<MermaidRenderer key={`mermaid-${i}`} chart={codeBlockContent.trim()} />);
          } else {
            blocks.push(
              <CodeRenderer
                key={`code-${i}`}
                code={codeBlockContent.trim()}
                language={codeBlockLang || "text"}
              />
            );
          }
          codeBlockContent = "";
          codeBlockLang = "";
          isCodeBlock = false;
        } else {
          flushParagraph(i);
          isCodeBlock = true;
          codeBlockLang = line.replace("```", "").trim();
        }
        continue;
      }

      if (isCodeBlock) {
        codeBlockContent += line + "\n";
        continue;
      }

      // Handle Admonitions (Callouts)
      if (line.trim().startsWith(":::")) {
        if (isCallout) {
          blocks.push(
            <CalloutRenderer
              key={`callout-${i}`}
              type={calloutType}
              content={calloutContent.trim()}
            />
          );
          calloutContent = "";
          calloutType = "";
          isCallout = false;
        } else {
          flushParagraph(i);
          isCallout = true;
          calloutType = line.replace(":::", "").trim() || "info";
        }
        continue;
      }

      if (isCallout) {
        calloutContent += line + "\n";
        continue;
      }

      // Handle Gist Embed Tag
      if (line.trim().startsWith("<gist")) {
        flushParagraph(i);
        const match = /id="([^"]+)"/.exec(line);
        if (match) {
          blocks.push(<GistRenderer key={`gist-${i}`} id={match[1]} />);
        }
        continue;
      }

      // Handle YouTube Embed Tag
      if (line.trim().startsWith("<youtube")) {
        flushParagraph(i);
        const match = /id="([^"]+)"/.exec(line);
        if (match) {
          blocks.push(<YouTubeRenderer key={`yt-${i}`} id={match[1]} />);
        }
        continue;
      }

      // Handle Headers
      if (line.trim().startsWith("#")) {
        flushParagraph(i);
        const depth = (line.match(/^#+/) || [""])[0].length;
        const text = line.replace(/^#+\s+/, "").trim();
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        
        if (depth === 1) {
          blocks.push(<h1 key={`h-${i}`} id={id} className="font-serif text-3xl md:text-4.5xl font-semibold text-foreground mt-12 mb-6">{text}</h1>);
        } else if (depth === 2) {
          blocks.push(<h2 key={`h-${i}`} id={id} className="font-serif text-2xl md:text-3.5xl font-semibold text-foreground mt-12 mb-6">{text}</h2>);
        } else {
          blocks.push(<h3 key={`h-${i}`} id={id} className="font-serif text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">{text}</h3>);
        }
        continue;
      }

      // Handle Math Block
      if (line.trim() === "$$") {
        flushParagraph(i);
        // Find closing $$
        let mathContent = "";
        let j = i + 1;
        while (j < lines.length && lines[j].trim() !== "$$") {
          mathContent += lines[j] + "\n";
          j++;
        }
        i = j;
        try {
          const mathHtml = katex.renderToString(mathContent.trim(), { displayMode: true });
          blocks.push(
            <div
              key={`math-block-${i}`}
              className="my-8 overflow-x-auto p-4 bg-muted-light/10 border border-border/40 rounded-lg flex justify-center text-foreground"
              dangerouslySetInnerHTML={{ __html: mathHtml }}
            />
          );
        } catch {
          blocks.push(<pre key={`math-err-${i}`} className="text-red-500 font-mono text-xs">{mathContent}</pre>);
        }
        continue;
      }

      // Handle list items
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        flushParagraph(i);
        // Collect continuous list items
        const listItems: string[] = [];
        let j = i;
        while (j < lines.length && (lines[j].trim().startsWith("- ") || lines[j].trim().startsWith("* "))) {
          listItems.push(lines[j].replace(/^[-*]\s+/, ""));
          j++;
        }
        i = j - 1;
        blocks.push(
          <ul key={`ul-${i}`} className="list-disc pl-6 mb-6 flex flex-col gap-2 text-muted">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
        continue;
      }

      // Standard text line
      if (line.trim() === "") {
        flushParagraph(i);
      } else {
        currentParagraph += (currentParagraph ? " " : "") + line;
      }
    }
    
    flushParagraph(lines.length);
    setRendered(blocks);
  }, [content]);

  return <>{rendered}</>;
}
