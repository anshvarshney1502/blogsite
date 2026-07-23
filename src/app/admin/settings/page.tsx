import React from "react";
import SettingsClient from "./settings-client";

export const metadata = {
  title: "Admin Settings Center",
  description: "Dynamic website configurators."
};

export default function AdminSettingsPage() {
  return <SettingsClient />;
}
