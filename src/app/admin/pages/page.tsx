import React from "react";
import PagesBuilderClient from "./pages-client";

export const metadata = {
  title: "Page Builder — Admin",
  description: "Drag-and-drop visual editor for all site pages.",
};

export default function AdminPagesPage() {
  return <PagesBuilderClient />;
}
