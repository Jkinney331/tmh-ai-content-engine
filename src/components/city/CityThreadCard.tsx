import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { City } from "@/types/city";

const FLAG_BY_COUNTRY: Record<string, string> = {
  USA: "🇺🇸",
  "United States": "🇺🇸",
  Japan: "🇯🇵",
  Korea: "🇰🇷",
  "South Korea": "🇰🇷",
  France: "🇫🇷",
  UK: "🇬🇧",
  "United Kingdom": "🇬🇧",
  China: "🇨🇳",
};

interface CityThreadCardProps {
  city: City;
  isActive: boolean;
  onClick: () => void;
}

export function CityThreadCard({ city, isActive, onClick }: CityThreadCardProps) {
  const flag = city.country ? (FLAG_BY_COUNTRY[city.country] || "🏙️") : "🏙️";
  const tier = city.metadata?.tier as string | undefined;
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface)] px-3 py-3 text-left transition duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_rgba(45,212,191,0.12)]",
        isActive && "border-primary/60 bg-[color:var(--surface-strong)] shadow-[0_0_0_1px_rgba(45,212,191,0.3)]",
      )}
    >
      <div className="text-2xl">{flag}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{city.name}</p>
          {tier && (
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
              {tier}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{city.country || "City"}</p>
      </div>
    </button>
  );
}
