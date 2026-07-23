import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/mdx";

export const runtime = "nodejs";
export const alt = "Ansh Varshney — Dynamic Article Cards";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#09090b",
            color: "#f4f4f5",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: "bold" }}>ANSH VARSHNEY</div>
        </div>
      ),
      size
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          padding: "80px",
          color: "#f4f4f5",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Tag Category */}
          <div
            style={{
              fontSize: "16px",
              fontFamily: "monospace",
              color: "#3b82f6",
              textTransform: "uppercase",
              letterSpacing: "4px",
              marginBottom: "32px",
            }}
          >
            {post.metadata.category}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              lineHeight: "1.15",
              color: "#ffffff",
              marginBottom: "24px",
              letterSpacing: "-2px",
            }}
          >
            {post.metadata.title}
          </div>

          {/* Excerpt */}
          <div
            style={{
              fontSize: "24px",
              color: "#a1a1aa",
              lineHeight: "1.5",
              maxHeight: "120px",
              overflow: "hidden",
            }}
          >
            {post.metadata.description}
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #1f1f23",
            paddingTop: "40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                fontSize: "18px",
                fontFamily: "monospace",
                color: "#f4f4f5",
                fontWeight: "bold",
              }}
            >
              ANSH VARSHNEY
            </div>
            <div
              style={{
                fontSize: "14px",
                fontFamily: "monospace",
                color: "#a1a1aa",
                marginLeft: "16px",
              }}
            >
              by Ansh Varshney
            </div>
          </div>

          <div
            style={{
              fontSize: "16px",
              fontFamily: "monospace",
              color: "#a1a1aa",
            }}
          >
            {post.metadata.readingTime} • {post.metadata.date}
          </div>
        </div>
      </div>
    ),
    size
  );
}
