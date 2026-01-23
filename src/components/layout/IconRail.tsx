import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Grid2X2, ImageIcon, Layers, Settings, Video } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const items = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: Grid2X2 },
  { id: "generate", label: "Generate", href: "/generate", icon: Layers },
  { id: "images", label: "Images", href: "/generate/image", icon: ImageIcon },
  { id: "video", label: "Video", href: "/generate/video", icon: Video },
  { id: "knowledge", label: "Knowledge Base", href: "/settings/knowledge-base", icon: Book },
];

export function IconRail() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={100}>
      <aside className="flex h-full w-12 flex-col items-center gap-3 border-r border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] py-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Link
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:text-foreground",
                    isActive && "text-primary",
                  )}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <span className="absolute left-[-10px] h-8 w-1 rounded-full bg-primary shadow-[0_0_12px_rgba(45,212,191,0.7)]" />
                  )}
                  <Icon className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
        <div className="mt-auto pb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:text-foreground"
                href="/settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
