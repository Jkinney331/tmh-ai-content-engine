import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddCityModal from "@/components/AddCityModal";
import { useCityStore } from "@/stores/cityStore";
import { useGenerationStore } from "@/stores/generationStore";
import type { City } from "@/types/city";
import { cn } from "@/lib/utils";

interface CitySidebarProps {
  collapsed: boolean;
}

export function CitySidebar({ collapsed }: CitySidebarProps) {
  const { cities, setCities, selectedCity, selectCity } = useCityStore();
  const { setSelectedCity } = useGenerationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const drops = useMemo(() => {
    if (!cities.length) return [];
    return [
      {
        id: "drop-1",
        name: "Drop 1",
        status: "Draft",
        cityCount: Math.min(3, cities.length),
        launchDate: null,
      },
    ];
  }, [cities.length]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch("/api/cities");
        if (response.ok) {
          const data = await response.json();
          setCities(Array.isArray(data) ? data : data.cities || []);
        }
      } catch (error) {
        console.error("Failed to load cities:", error);
      }
    };

    if (cities.length === 0) {
      loadCities();
    }
  }, [cities.length, setCities]);

  const handleSelect = (city: City) => {
    selectCity(city);
    setSelectedCity(city);
  };

  const filtered = cities.filter((city) =>
    city.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      <aside
        className={cn(
          "relative h-full border-r border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] transition-all duration-300",
          collapsed ? "w-0 overflow-hidden" : "w-[260px]",
        )}
      >
        <div className="flex h-full flex-col gap-4 px-4 py-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">City Threads</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search cities..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button variant="secondary" className="justify-start gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add New City
          </Button>
          <ScrollArea className="h-full pr-2">
            <div className="flex flex-col gap-2">
              {filtered.map((city, index) => {
                const isActive = selectedCity?.id === city.id;
                return (
                  <button
                    key={city.id}
                    className={cn(
                      "rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3 text-left transition hover:border-primary/40 animate-[page-enter_400ms_ease-out_forwards]",
                      isActive && "border-primary/50 bg-primary/10",
                    )}
                    style={{ animationDelay: `${50 * (index + 1)}ms` }}
                    onClick={() => handleSelect(city)}
                  >
                    <p className="text-sm font-semibold">{city.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{city.country}</p>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-3 text-xs text-muted-foreground">
                  No cities match this search.
                </div>
              )}
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Drops</p>
                <Link
                  href="/drops"
                  className="text-xs text-primary hover:text-primary/80"
                >
                  New
                </Link>
              </div>
              {drops.length === 0 && (
                <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-3 text-xs text-muted-foreground">
                  No drops yet.
                </div>
              )}
              {drops.map((drop) => (
                <Link
                  key={drop.id}
                  href={`/drops/${drop.id}`}
                  className="rounded-lg border border-[color:var(--surface-border)] bg-[color:var(--surface-muted)] p-3 text-left transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{drop.name}</p>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-primary">
                      {drop.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{drop.cityCount} cities</p>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </aside>
      <AddCityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
