import "./globals.css"; 
import { Toaster } from "@/components/ui/toaster";
import { GradientBG } from "@/components/ui/gradient-bg";
import { NProgressClient } from "@/components/layout/NProgressClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <GradientBG />
        <NProgressClient>{children}</NProgressClient>
        <Toaster />
      </body>
    </html>
  );
}
