// src/app/admin/pages/[slug]/page.tsx
"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

const PageBuilder = dynamic(() => import("@/components/admin/page-builder"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 text-muted gap-2">
      <RefreshCw className="h-5 w-5 animate-spin" />
      <span className="font-mono text-sm">Loading page builder...</span>
    </div>
  ),
});

export default function PageBuilderSlugPage() {
  const { slug } = useParams() as { slug: string };
  return (
    <PageBuilder
      key={slug}
      pageSlug={slug}
      pageLabel={slug.charAt(0).toUpperCase() + slug.slice(1) + " Page"}
      initialBlocks={[]}
    />
  );
}
