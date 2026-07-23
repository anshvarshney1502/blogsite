import { prisma } from "./prisma";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_PATH = path.join(process.cwd(), "content/blog");

function getAllLocalBlogs() {
  if (!fs.existsSync(POSTS_PATH)) return [];
  const files = fs.readdirSync(POSTS_PATH);
  return files
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const fileContent = fs.readFileSync(path.join(POSTS_PATH, file), "utf-8");
      const { data, content } = matter(fileContent);
      return {
        id: file,
        title: data.title || "Untitled Post",
        description: data.description || "",
        content,
        date: data.date || new Date().toISOString().split("T")[0],
        updatedAt: data.updated || new Date().toISOString(),
        coverImage: data.cover || "/images/placeholder.jpg",
        category: data.category || "General",
        tags: data.tags || [],
        draft: data.draft ?? true,
        featured: data.featured ?? false,
        archived: data.archived ?? false,
        readingTime: data.readingTime || "5 min read",
        slug: data.slug || file.replace(/\.mdx?$/, ""),
        publishedAt: data.date ? new Date(data.date).toISOString() : null,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogs() {
  try {
    const dbBlogs = await prisma.blog.findMany({
      include: { category: true, tags: true },
      orderBy: { createdAt: "desc" }
    });
    return dbBlogs.map(b => ({
      id: b.id,
      title: b.title,
      description: b.description,
      content: b.content,
      coverImage: b.coverImage || "/images/placeholder.jpg",
      readingTime: b.readingTime,
      publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
      draft: b.draft,
      featured: b.featured,
      archived: b.archived,
      slug: b.slug,
      date: b.createdAt.toISOString().split("T")[0],
      category: b.category?.name || "General",
      tags: b.tags.map(t => t.name)
    }));
  } catch (err) {
    console.warn("DB offline, falling back to local files:", err);
    return getAllLocalBlogs();
  }
}

export async function getBlog(slug: string) {
  try {
    const b = await prisma.blog.findUnique({
      where: { slug },
      include: { category: true, tags: true }
    });
    if (!b) return null;
    return {
      title: b.title,
      description: b.description,
      content: b.content,
      coverImage: b.coverImage || "/images/placeholder.jpg",
      readingTime: b.readingTime,
      publishedAt: b.publishedAt ? b.publishedAt.toISOString() : null,
      draft: b.draft,
      featured: b.featured,
      archived: b.archived,
      slug: b.slug,
      date: b.createdAt.toISOString().split("T")[0],
      category: b.category?.name || "General",
      tags: b.tags.map(t => t.name)
    };
  } catch {
    const local = getAllLocalBlogs().find(p => p.slug === slug);
    return local || null;
  }
}

export async function createBlog(data: { title: string; slug: string; categoryName: string }) {
  try {
    const cat = await prisma.category.upsert({
      where: { name: data.categoryName },
      update: {},
      create: { name: data.categoryName, slug: data.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-") }
    });

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "admin@anshvarshney.com",
          passwordHash: "secure",
          firstName: "Ansh",
          lastName: "Varshney",
          role: "ADMIN"
        }
      });
    }

    return await prisma.blog.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: "A newly created database-persisted post.",
        content: "# Introduction\n\nBegin writing your markdown article here.",
        readingTime: "5 min read",
        draft: true,
        featured: false,
        archived: false,
        authorId: user.id,
        categoryId: cat.id
      }
    });
  } catch (err) {
    console.warn("Prisma failed to write, writing locally:", err);
    const targetSlug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filePath = path.join(POSTS_PATH, `${targetSlug}.mdx`);
    
    const templateContent = `---
title: "${data.title}"
description: "A newly created local post."
date: "${new Date().toISOString().split("T")[0]}"
updated: "${new Date().toISOString().split("T")[0]}"
cover: "/images/placeholder.jpg"
category: "${data.categoryName}"
tags:
  - "${data.categoryName}"
draft: true
featured: false
archived: false
readingTime: "5 min read"
---

# Introduction

Begin writing your markdown article here.
`;
    fs.writeFileSync(filePath, templateContent, "utf-8");
    return { slug: targetSlug };
  }
}

interface UpdateBlogData {
  title: string;
  description: string;
  content: string;
  cover?: string;
  draft: boolean;
  featured: boolean;
  archived: boolean;
  publishedAt?: string | null;
  category: string;
  tags?: string[];
  date?: string;
  readingTime?: string;
}

export async function updateBlog(slug: string, updateData: UpdateBlogData) {
  try {
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (!existing) throw new Error("Not found");

    const cat = await prisma.category.upsert({
      where: { name: updateData.category },
      update: {},
      create: { name: updateData.category, slug: updateData.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") }
    });

    return await prisma.blog.update({
      where: { slug },
      data: {
        title: updateData.title,
        description: updateData.description,
        content: updateData.content,
        coverImage: updateData.cover,
        draft: updateData.draft,
        featured: updateData.featured,
        archived: updateData.archived,
        publishedAt: updateData.publishedAt ? new Date(updateData.publishedAt) : null,
        categoryId: cat.id
      }
    });
  } catch (err) {
    console.warn("Prisma failed to update, writing locally:", err);
    const filePath = path.join(POSTS_PATH, `${slug}.mdx`);
    const mdxString = matter.stringify(updateData.content, {
      title: updateData.title,
      description: updateData.description,
      date: updateData.date || new Date().toISOString().split("T")[0],
      updated: new Date().toISOString().split("T")[0],
      cover: updateData.cover || "/images/placeholder.jpg",
      category: updateData.category,
      tags: updateData.tags || [updateData.category],
      draft: updateData.draft ?? true,
      featured: updateData.featured ?? false,
      archived: updateData.archived ?? false,
      readingTime: updateData.readingTime || "5 min read",
    });
    fs.writeFileSync(filePath, mdxString, "utf-8");
    return { success: true };
  }
}

export async function deleteBlog(slug: string) {
  try {
    return await prisma.blog.delete({ where: { slug } });
  } catch (err) {
    console.warn("Prisma failed to delete, deleting locally:", err);
    const mdxPath = path.join(POSTS_PATH, `${slug}.mdx`);
    const mdPath = path.join(POSTS_PATH, `${slug}.md`);
    if (fs.existsSync(mdxPath)) fs.unlinkSync(mdxPath);
    else if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
    return { success: true };
  }
}
