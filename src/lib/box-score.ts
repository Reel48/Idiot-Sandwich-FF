import type { SleeperMatchup } from "./sleeper/types";
import type { PlayerLite } from "./sleeper/players";

export interface BoxLine {
  slot: string;
  playerId: string;
  name: string;
  pos: string | null;
  nflTeam: string | null;
  points: number;
  empty: boolean;
}

export interface TeamBox {
  rosterId: number;
  lines: BoxLine[];
  benchTotal: number;
  starterTotal: number;
}

const NON_STARTER_SLOTS = new Set(["BN", "IR", "TAXI"]);

export function starterSlots(rosterPositions: string[]): string[] {
  return rosterPositions.filter((p) => !NON_STARTER_SLOTS.has(p));
}

/** Build one team's box score from a raw matchup entry. Returns null when
 *  Sleeper has no starter data for the game (very old seasons). */
export function buildTeamBox(
  raw: SleeperMatchup,
  rosterPositions: string[],
  players: Map<string, PlayerLite>,
): TeamBox | null {
  const starters = raw.starters;
  if (!starters || starters.length === 0) return null;

  const slots = starterSlots(rosterPositions);
  const lines: BoxLine[] = starters.map((id, i) => {
    const empty = !id || id === "0";
    const p = empty ? undefined : players.get(id);
    const points = raw.starters_points?.[i] ?? raw.players_points?.[id] ?? 0;
    return {
      slot: slots[i] ?? p?.pos ?? "—",
      playerId: id,
      name: empty ? "Empty slot" : (p?.name ?? id),
      // Team defenses are keyed by team code and may miss position data.
      pos: empty ? null : (p?.pos ?? (id === id.toUpperCase() ? "DEF" : null)),
      nflTeam: empty ? null : (p?.team ?? null),
      points,
      empty,
    };
  });

  const starterSet = new Set(starters);
  let benchTotal = 0;
  if (raw.players_points && raw.players) {
    for (const id of raw.players) {
      if (!starterSet.has(id)) benchTotal += raw.players_points[id] ?? 0;
    }
  }

  return {
    rosterId: raw.roster_id,
    lines,
    benchTotal,
    starterTotal: lines.reduce((t, l) => t + l.points, 0),
  };
}
