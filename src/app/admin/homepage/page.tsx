import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import HomepageBuilderClient from "./homepage-builder-client";

export const metadata: Metadata = {
  title: "Homepage Builder — Admin",
};

function getSections() {
  const dbPath = path.join(process.cwd(), "content/db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  return db.homepage_sections || [];
}

export default function HomepagePage() {
  const sections = getSections();
  return (
    <div className="py-8 px-4 md:px-8 max-w-5xl mx-auto">
      <HomepageBuilderClient initialSections={sections} />
    </div>
  );
}
