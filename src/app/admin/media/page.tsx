import type { Metadata } from "next";
import MediaLibraryClient from "./media-client";

export const metadata: Metadata = {
  title: "Media Library — Admin",
};

export default function MediaPage() {
  return (
    <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
      <MediaLibraryClient />
    </div>
  );
}
