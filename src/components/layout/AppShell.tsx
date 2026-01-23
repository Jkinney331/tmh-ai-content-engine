"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { IconRail } from "@/components/layout/IconRail";
import { CitySidebar } from "@/components/layout/CitySidebar";
import { ChatDock } from "@/components/layout/ChatDock";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import ChatPanel from "@/components/ChatPanel";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const headerTitle = useMemo(() => {
    if (pathname.startsWith("/generate/video")) return "Video Generation";
    if (pathname.startsWith("/generate/image")) return "Image Generation";
    if (pathname.startsWith("/generate")) return "Generate";
    if (pathname.startsWith("/library")) return "Library";
    if (pathname.startsWith("/cities")) return "City Intelligence";
    if (pathname.startsWith("/settings/knowledge-base")) return "Knowledge Base";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Dashboard";
  }, [pathname]);

  return (
    <div className="app-shell relative h-screen overflow-hidden">
      <div className="app-glow pointer-events-none absolute inset-0" />
      <div className="relative flex h-full">
        <IconRail />
        <CitySidebar collapsed={sidebarCollapsed} />

        <main className="flex h-full flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-[color:var(--surface-border)] px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="icon" onClick={() => setSidebarCollapsed((prev) => !prev)}>
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  TMH City Intelligence
                </p>
                <p className="text-sm font-semibold">{headerTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark((prev) => !prev)} />
              <Button variant="secondary" size="icon" onClick={() => setChatCollapsed((prev) => !prev)}>
                <span className={cn("text-xs", chatCollapsed ? "text-muted-foreground" : "text-primary")}>
                  AI
                </span>
              </Button>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="animate-[page-enter_400ms_ease-out]">{children}</div>
          </div>
        </main>

        <ChatDock collapsed={chatCollapsed} />
      </div>

      <ChatPanel />
    </div>
  );
}
