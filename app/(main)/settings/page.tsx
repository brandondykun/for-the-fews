"use client";

import React from "react";

import ColorModeSwitch from "@/components/ui/colorModeSwitch";

export default function SettingsPage() {
  return (
    <main className="flex flex-1 flex-col bg-neutral-50 dark:bg-neutral-800 h-[calc(100dvh-64px)] p-4 sm:p-8">
      <h1 className="text-xl md:text-2xl font-semibold mb-4">Settings</h1>
      <div>
        <div className="flex items-center gap-4">
          <h2>Theme</h2>
          <ColorModeSwitch />
        </div>
      </div>
    </main>
  );
}
