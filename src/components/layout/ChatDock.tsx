import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useChatStore } from "@/stores/chatStore";
import { cn } from "@/lib/utils";

interface ChatDockProps {
  collapsed: boolean;
}

export function ChatDock({ collapsed }: ChatDockProps) {
  const { isOpen, toggleChat } = useChatStore();
  const [autoMode, setAutoMode] = useState(false);
  const [autonomyMode, setAutonomyMode] = useState<"Manual" | "Assist" | "Auto">("Assist");

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
            <Bot className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">AI Assistant</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            1.2k tokens
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-1 text-xs">
            Model: Default
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] px-3 py-1 text-xs">
            <span>Auto</span>
            <Switch checked={autoMode} onCheckedChange={setAutoMode} />
          </div>
          <div className="flex items-center gap-1 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-1 text-[11px]">
            {(["Manual", "Assist", "Auto"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setAutonomyMode(mode)}
                className={cn(
                  "rounded-full px-2 py-1 transition",
                  autonomyMode === mode
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm">
            Memory: On
          </Button>
        </div>
        <div className="surface-strong rounded-lg p-3 text-xs text-muted-foreground">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Provenance</p>
          <p>Sources: City research, TMH Archive, verified web signals.</p>
        </div>
        <div className="surface-strong rounded-lg p-3 text-xs text-muted-foreground">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Memory Scope</p>
          <p>City memory enabled for this workspace.</p>
        </div>
        <div className="surface-strong rounded-lg p-3 text-xs text-muted-foreground">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Feedback</p>
          <div className="mt-2 flex items-center gap-2">
            <Button variant="secondary" size="sm">
              👍 Helpful
            </Button>
            <Button variant="secondary" size="sm">
              👎 Needs Work
            </Button>
          </div>
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
