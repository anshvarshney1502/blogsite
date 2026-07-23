import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://anshit.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/admin/login", "/admin/settings"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
