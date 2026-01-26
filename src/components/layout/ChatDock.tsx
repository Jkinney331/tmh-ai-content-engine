import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useChatStore } from "@/stores/chatStore";
import { useCityStore } from "@/stores/cityStore";
import { cn } from "@/lib/utils";

interface ChatDockProps {
  collapsed: boolean;
}

export function ChatDock({ collapsed }: ChatDockProps) {
  const pathname = usePathname();
  const { selectedCity } = useCityStore();
  const {
    isLoading,
    currentConversation,
    error,
    setLoading,
    setError,
    addMessage,
    startNewConversation,
    clearCurrentConversation,
    updateContext,
  } = useChatStore();

  const [autoMode, setAutoMode] = useState(false);
  const [autonomyMode, setAutonomyMode] = useState<"Manual" | "Assist" | "Auto">("Assist");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = useMemo(() => {
    const cityName = selectedCity?.name || "this city";
    return [
      `Summarize the latest ${cityName} research insights.`,
      `Generate 5 design concepts for ${cityName}.`,
      `What assets are missing for ${cityName}?`,
    ];
  }, [selectedCity?.name]);

  useEffect(() => {
    updateContext({
      page: pathname,
      cityId: selectedCity?.id,
    });
  }, [pathname, selectedCity?.id, updateContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  useEffect(() => {
    if (!selectedCity?.id) return;

    startNewConversation({
      page: pathname,
      cityId: selectedCity.id,
    });

    const loadSummary = async () => {
      try {
        const [elementsResponse, assetsResponse] = await Promise.all([
          fetch(`/api/cities/${selectedCity.id}/elements`),
          fetch(`/api/generated-content?city_id=${selectedCity.id}&limit=6`),
        ]);

        const elements = elementsResponse.ok ? await elementsResponse.json() : [];
        const assets = assetsResponse.ok ? await assetsResponse.json() : { data: [] };

        const researchCount = Array.isArray(elements) ? elements.length : 0;
        const assetsCount = Array.isArray(assets?.data) ? assets.data.length : 0;
        const researchRun = Array.isArray(elements)
          ? elements.find((item: any) => item.element_type === "research_run")
          : null;
        const lastRun = researchRun?.created_at
          ? new Date(researchRun.created_at).toLocaleString()
          : "Not started yet";

        addMessage({
          role: "assistant",
          content: `Welcome back. ${selectedCity.name} status: ${researchCount} research items, ${assetsCount} assets. Last research run: ${lastRun}.`,
        });
      } catch (err) {
        console.error("Chat summary error:", err);
      }
    };

    loadSummary();
  }, [addMessage, pathname, selectedCity?.id, selectedCity?.name, startNewConversation]);

  const handleSubmit = async (message?: string) => {
    const userMessage = (message ?? input).trim();
    if (!userMessage || isLoading) return;

    setInput("");

    if (!currentConversation) {
      startNewConversation({
        page: pathname,
        cityId: selectedCity?.id,
      });
    }

    addMessage({ role: "user", content: userMessage });
    setLoading(true);
    setError(null);

    try {
      const messages = [
        ...(currentConversation?.messages || []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user" as const, content: userMessage },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          context: {
            page: pathname,
            cityId: selectedCity?.id,
            cityName: selectedCity?.name,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();
      addMessage({ role: "assistant", content: data.message });
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
            Live
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
          <Button variant="secondary" size="sm" onClick={clearCurrentConversation}>
            <Trash2 className="h-3 w-3" />
            New Thread
          </Button>
        </div>
        <div className="surface-strong rounded-lg p-3 text-xs text-muted-foreground">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Provenance</p>
          <p>Sources: City research, TMH archive, verified web signals.</p>
        </div>
        <div className="surface-strong rounded-lg p-3 text-xs text-muted-foreground">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Memory Scope</p>
          <p>Scoped to {selectedCity?.name || "current workspace"}.</p>
        </div>
        <div className="surface-strong rounded-lg p-3 text-xs text-muted-foreground">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Quick prompts</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {promptSuggestions.map((prompt) => (
              <Button key={prompt} variant="secondary" size="sm" onClick={() => handleSubmit(prompt)}>
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] p-3 text-sm text-muted-foreground">
          {(currentConversation?.messages || []).length === 0 && (
            <div className="text-xs text-muted-foreground">
              Ask about research, request new concepts, or generate assets for the selected city.
            </div>
          )}
          <div className="space-y-3">
            {(currentConversation?.messages || []).map((message) => (
              <div
                key={message.id}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs",
                  message.role === "user"
                    ? "bg-primary/15 text-foreground"
                    : "bg-[color:var(--surface-muted)] text-muted-foreground",
                )}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary">
                  {message.role === "user" ? "You" : "Assistant"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <form
          className="flex items-center gap-2 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] p-2"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={`Ask about ${selectedCity?.name || "your city"}...`}
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
          />
          <Button size="sm" type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </aside>
  );
}
