import React from "react";
import { getDb } from "@/lib/db";
import AboutClient from "./about-client";

export async function generateMetadata() {
  const db = getDb();
  return {
    title: `About — ${db.site.name}`,
    description: db.site.headline,
  };
}

export default async function AboutPage() {
  const db = getDb();
  return <AboutClient db={db} />;
}
