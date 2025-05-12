"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/90 text-foreground transition-colors duration-500">
      <Sidebar />
      <div 
        className={cn(
          "transition-all duration-300 min-h-screen",
          collapsed ? "pl-[72px]" : "pl-[240px]",
          "md:pr-0"
        )}
      >
        <Topbar />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="p-4 sm:p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}