import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PostMetadata } from "@/lib/mdx";

interface ArticleCardProps {
  article: PostMetadata;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const category = article.tags[0] || "General";
  return (
    <Link href={`/writings/${article.slug}`} className="group block">
      <article className="relative flex flex-col justify-between p-6 h-full rounded-xl neomorphic-card">
        <div>
          {/* Metadata */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-mono tracking-wider text-muted uppercase">
              {category}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <span>{article.date}</span>
              <span>•</span>
              <span>{article.readingTime}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl font-semibold leading-snug text-foreground mb-2 group-hover:text-accent transition-colors flex items-start gap-1">
            <span>{article.title}</span>
            <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all duration-300 text-accent shrink-0 mt-1" />
          </h3>

          {/* Excerpt */}
          <p className="text-sm leading-relaxed text-muted line-clamp-3 mb-6">
            {article.description}
          </p>
        </div>

        {/* Read Article Link */}
        <div className="text-xs font-mono font-medium text-foreground/80 group-hover:text-accent transition-colors flex items-center gap-1 mt-auto">
          <span>Read essay</span>
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </div>
      </article>
    </Link>
  );
}
