import { getDb } from "@/lib/db";

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

export function buildMetadata(config: SEOConfig = {}) {
  const db = getDb();
  const siteName = db.site.name || "Ansh Varshney";
  const defaultDescription = db.site.seoDescription || "Personal technical journal";
  
  const title = config.title ? `${config.title} — ${siteName}` : `${siteName} — Journal`;
  const description = config.description || defaultDescription;
  const keywords = config.keywords || db.focus_areas || [];
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anshit.com";
  const canonical = config.canonicalUrl || siteUrl;
  const ogImage = config.ogImage || `${siteUrl}/default-og.png`;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: config.type || "website",
      ...(config.type === "article" && {
        publishedTime: config.publishedTime,
        modifiedTime: config.modifiedTime,
        authors: [siteName],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@anshvarshneyy",
    },
  };
}
