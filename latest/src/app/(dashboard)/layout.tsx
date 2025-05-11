"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ReactNode, useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("taskup_token");

    if (!token) {
      router.replace("/auth/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  if (!authChecked) return null; 
  
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}