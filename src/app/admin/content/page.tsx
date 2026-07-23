import React from "react";
import fs from "fs";
import path from "path";
import ContentEditorClient from "./content-editor-client";

export const metadata = {
  title: "Content Editor — Admin",
  description: "Edit all site content sections and publish live.",
};

export default async function ContentEditorPage() {
  const dbPath = path.join(process.cwd(), "content/db.json");
  const raw = fs.readFileSync(dbPath, "utf-8");
  const data = JSON.parse(raw);
  return <ContentEditorClient initialData={data} />;
}
