"use client";

import { useNProgress } from "@/hooks/useNProgress";

export function NProgressClient({ children }: { children: React.ReactNode }) {
  useNProgress();
  return <>{children}</>;
}
