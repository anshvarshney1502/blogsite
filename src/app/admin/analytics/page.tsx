import type { Metadata } from "next";
import AnalyticsDashboardClient from "./analytics-client";

export const metadata: Metadata = {
  title: "Analytics — Admin",
};

export default function AnalyticsPage() {
  return (
    <div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
      <AnalyticsDashboardClient />
    </div>
  );
}
