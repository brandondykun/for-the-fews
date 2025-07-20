"use client";

import React from "react";

import { Moon, Sun } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/theme-context";

const ColorModeSwitch = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        <Sun size={18} className="dark:text-neutral-500 text-neutral-950" />
      </span>
      <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
      <span className="text-sm text-neutral-700 dark:text-neutral-300">
        <Moon size={18} className="dark:text-neutral-100 text-neutral-400" />
      </span>
    </div>
  );
};

export default ColorModeSwitch;
