import type { City } from "@/types/city";

export const cityThreadSeeds: City[] = [
  {
    id: "tokyo",
    name: "Tokyo",
    state: "",
    country: "Japan",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T1", lastActivity: "2m ago" },
  },
  {
    id: "shanghai",
    name: "Shanghai",
    state: "",
    country: "China",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T1", lastActivity: "10m ago" },
  },
  {
    id: "seoul",
    name: "Seoul",
    state: "",
    country: "South Korea",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T1", lastActivity: "25m ago" },
  },
  {
    id: "london",
    name: "London",
    state: "",
    country: "United Kingdom",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T1", lastActivity: "1h ago" },
  },
  {
    id: "paris",
    name: "Paris",
    state: "",
    country: "France",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T1", lastActivity: "2h ago" },
  },
  {
    id: "new-york",
    name: "New York",
    state: "New York",
    country: "United States",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T1", lastActivity: "3h ago" },
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    state: "California",
    country: "United States",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T2", lastActivity: "5h ago" },
  },
  {
    id: "detroit",
    name: "Detroit",
    state: "Michigan",
    country: "United States",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T2", lastActivity: "8h ago" },
  },
  {
    id: "chicago",
    name: "Chicago",
    state: "Illinois",
    country: "United States",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T2", lastActivity: "1d ago" },
  },
  {
    id: "miami",
    name: "Miami",
    state: "Florida",
    country: "United States",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T2", lastActivity: "1d ago" },
  },
  {
    id: "compton",
    name: "Compton",
    state: "California",
    country: "United States",
    status: "active",
    areaCodes: [],
    nicknameCount: 0,
    metadata: { tier: "T3", lastActivity: "2d ago" },
  },
];

export function mergeCityThreads(existing: City[]) {
  const byName = new Map(existing.map((city) => [city.name.toLowerCase(), city]));
  const merged = [...existing];
  cityThreadSeeds.forEach((seed) => {
    if (!byName.has(seed.name.toLowerCase())) {
      merged.push(seed);
    }
  });
  return merged;
}
