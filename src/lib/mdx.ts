import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PostMetadata {
  title: string;
  description: string;
  date: string;
  updated: string;
  cover: string;
  category: string;
  tags: string[];
  series?: string;
  draft: boolean;
  featured: boolean;
  readingTime: string;
  slug: string;
  outline?: { id: string; title: string }[];
}

export interface Post {
  metadata: PostMetadata;
  content: string;
}

const POSTS_PATH = path.join(process.cwd(), "content/blog");

export function getAllPosts(): PostMetadata[] {
  if (!fs.existsSync(POSTS_PATH)) {
    return [];
  }

  const files = fs.readdirSync(POSTS_PATH);
  
  const posts = files
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(POSTS_PATH, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);

      return {
        ...(data as Omit<PostMetadata, "slug">),
        slug: data.slug || file.replace(/\.mdx?$/, ""),
      } as PostMetadata;
    })
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const postPath = path.join(POSTS_PATH, `${slug}.mdx`);
    const fileContent = fs.readFileSync(
      fs.existsSync(postPath) ? postPath : path.join(POSTS_PATH, `${slug}.md`),
      "utf-8"
    );

    const { data, content } = matter(fileContent);
    const metadata = {
      ...(data as Omit<PostMetadata, "slug">),
      slug: data.slug || slug,
    } as PostMetadata;

    return { metadata, content };
  } catch {
    return null;
  }
}
