import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chatStore";
import { cn } from "@/lib/utils";

interface ChatDockProps {
  collapsed: boolean;
}

export function ChatDock({ collapsed }: ChatDockProps) {
  const { isOpen, toggleChat } = useChatStore();

  return (
    <aside
      className={cn(
        "hidden h-full flex-col border-l border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] transition-all duration-300 lg:flex",
        collapsed ? "w-0 overflow-hidden" : "w-[360px]",
      )}
    >
      <div className="flex h-full flex-col gap-4 px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">AI Assistant</p>
          </div>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
        <div className="surface-strong rounded-lg p-3 text-xs text-muted-foreground">
          Chat is available across all workflows and stays in sync with your selected city.
        </div>
        <div className="mt-auto">
          <Button variant="secondary" className="w-full" onClick={toggleChat}>
            {isOpen ? "Hide Assistant" : "Open Assistant"}
          </Button>
        </div>
      </div>
    </aside>
  );
}
