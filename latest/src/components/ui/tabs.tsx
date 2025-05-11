
"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
}

export function Tabs({ tabs, value, onChange, className, fullWidth = false }: TabsProps) {
  const selectedIndex = tabs.findIndex((t) => t.value === value);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-start rounded-lg border bg-muted p-1 text-sm font-medium shadow-sm",
        fullWidth ? "w-full" : "max-w-max",
        className
      )}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "relative z-10 px-4 py-1.5 transition-all",
            value === tab.value ? "text-foreground" : "text-muted-foreground"
          )}
          style={{ width: fullWidth ? `${100 / tabs.length}%` : undefined }}
        >
          {tab.label}
        </button>
      ))}

      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute top-0 left-0 h-full rounded-md bg-background shadow-inner"
        style={{
          width: fullWidth ? `${100 / tabs.length}%` : undefined,
          transform: `translateX(${selectedIndex * 100}%)`,
        }}
      />
    </div>
  );
}
