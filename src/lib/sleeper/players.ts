// Slim player lookup for box scores. The full players/nfl payload is ~5MB,
// which exceeds Next's 2MB per-item fetch cache limit, so `next.revalidate`
// would silently never cache it. Instead: fetch uncached, reduce to the few
// fields we render, and memoize the slim map at module scope (one fetch per
// warm lambda per day).

export interface PlayerLite {
  name: string;
  pos: string | null;
  team: string | null;
}

interface RawPlayer {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  position?: string | null;
  team?: string | null;
  fantasy_positions?: string[] | null;
}

const TTL = 24 * 60 * 60 * 1000;

let cache: { at: number; map: Map<string, PlayerLite> } | null = null;
let inflight: Promise<Map<string, PlayerLite>> | null = null;

export async function getPlayersLite(): Promise<Map<string, PlayerLite>> {
  if (cache && Date.now() - cache.at < TTL) return cache.map;
  if (inflight) return inflight;

  inflight = (async () => {
    const res = await fetch("https://api.sleeper.app/v1/players/nfl", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Sleeper players fetch failed: ${res.status}`);
    const raw = (await res.json()) as Record<string, RawPlayer>;
    const map = new Map<string, PlayerLite>();
    for (const [id, p] of Object.entries(raw)) {
      map.set(id, {
        name:
          p.full_name ||
          [p.first_name, p.last_name].filter(Boolean).join(" ") ||
          id,
        pos: p.position ?? p.fantasy_positions?.[0] ?? null,
        team: p.team ?? null,
      });
    }
    cache = { at: Date.now(), map };
    return map;
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}
