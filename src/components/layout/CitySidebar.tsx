import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { CityThreadCard } from "@/components/city/CityThreadCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddCityModal from "@/components/AddCityModal";
import { useCityStore } from "@/stores/cityStore";
import { useGenerationStore } from "@/stores/generationStore";
import type { City } from "@/types/city";
import { mergeCityThreads } from "@/data/cityThreads";
import { cn } from "@/lib/utils";

interface CitySidebarProps {
  collapsed: boolean;
}

export function CitySidebar({ collapsed }: CitySidebarProps) {
  const router = useRouter();
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
        totalAssets: 0,
        launchDate: "TBD",
      },
    ];
  }, [cities.length]);
  const hasDraftDrop = drops.some((drop) => drop.status === "Draft");

  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch("/api/cities");
        if (response.ok) {
          const data = await response.json();
          const resolved = Array.isArray(data) ? data : data.cities || [];
          const merged = mergeCityThreads(resolved);
          setCities(merged);
          const hasSlugOnly = merged.some((city) => !isUuid(city.id));
          if (hasSlugOnly) {
            await fetch("/api/cities/seed", { method: "POST" });
            const refreshed = await fetch("/api/cities");
            if (refreshed.ok) {
              const refreshedData = await refreshed.json();
              const refreshedList = Array.isArray(refreshedData)
                ? refreshedData
                : refreshedData.cities || [];
              setCities(mergeCityThreads(refreshedList));
            }
          }
        }
      } catch (error) {
        console.error("Failed to load cities:", error);
      }
    };

    if (cities.length === 0) {
      loadCities();
    }
  }, [cities.length, setCities]);

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const ensureCityExists = async (city: City) => {
    if (isUuid(city.id)) return city;

    const response = await fetch("/api/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: city.name,
        skipResearch: true,
        researchCategories: {
          slang: true,
          landmarks: true,
          sports: true,
          culture: true,
          visualIdentity: true,
          areaCodes: true,
        },
      }),
    });

    if (response.ok) {
      const created = await response.json();
      return { ...city, ...created };
    }

    if (response.status === 409) {
      const listResponse = await fetch("/api/cities");
      if (listResponse.ok) {
        const data = await listResponse.json();
        const list = Array.isArray(data) ? data : data.cities || [];
        const match = list.find((item: City) => item.name.toLowerCase() === city.name.toLowerCase());
        if (match) return { ...city, ...match };
      }
    }

    return city;
  };

  const handleSelect = async (city: City) => {
    const resolved = await ensureCityExists(city);
    if (resolved.id !== city.id) {
      setCities(cities.map((item) => (item.name === city.name ? resolved : item)));
    }
    selectCity(resolved);
    setSelectedCity(resolved);
    router.push(`/cities/${resolved.id}`);
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
          <ScrollArea className="h-full pr-2 pl-1">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                {filtered.map((city, index) => {
                  const isActive = selectedCity?.id === city.id;
                  return (
                    <div
                      key={city.id}
                      className="animate-[page-enter_400ms_ease-out_forwards]"
                      style={{ animationDelay: `${50 * (index + 1)}ms` }}
                    >
                      <CityThreadCard
                        city={city}
                        isActive={isActive}
                        onClick={() => handleSelect(city)}
                      />
                    </div>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <div className="rounded-lg border border-dashed border-[color:var(--surface-border)] p-3 text-xs text-muted-foreground">
                  No cities match this search.
                </div>
              )}
            </div>
            <div className="mt-4 border-t border-[color:var(--surface-border)] pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Drops</p>
                {!hasDraftDrop && (
                  <Button variant="secondary" size="sm">
                    New Drop
                  </Button>
                )}
              </div>
              <div className="mt-3 flex flex-col gap-2">
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
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{drop.name}</p>
                      <Badge variant={drop.status === "Launched" ? "amber" : "teal"}>
                        {drop.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{drop.cityCount} cities</span>
                      <span>{drop.totalAssets} assets</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Launch: {drop.launchDate}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-dashed border-[color:var(--surface-border)] p-3 text-xs text-muted-foreground">
                Active drop is highlighted and synced with the profile view.
              </div>
            </div>
          </ScrollArea>
        </div>
      </aside>
      <AddCityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
