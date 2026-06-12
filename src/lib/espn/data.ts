// The ESPN era (2017–2025): the Regular league's history before it moved to
// Sleeper. Data was exported once from ESPN's fantasy API into
// src/data/espn/*.json and is frozen — these seasons are final forever.
import type { FranchiseRecord, Game, H2HCell, Team } from "@/lib/data";

import s2017 from "@/data/espn/2017.json";
import s2018 from "@/data/espn/2018.json";
import s2019 from "@/data/espn/2019.json";
import s2020 from "@/data/espn/2020.json";
import s2021 from "@/data/espn/2021.json";
import s2022 from "@/data/espn/2022.json";
import s2023 from "@/data/espn/2023.json";
import s2024 from "@/data/espn/2024.json";
import s2025 from "@/data/espn/2025.json";

// ---------- Archive JSON shapes ----------

interface EspnMember {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

interface EspnTeam {
  id: number;
  abbrev: string;
  name: string;
  logo?: string | null;
  owners: string[];
  playoffSeed: number;
  finalRank: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
}

interface EspnMatchup {
  week: number;
  tier: string; // NONE | WINNERS_BRACKET | *_CONSOLATION_LADDER
  winner: string; // HOME | AWAY | UNDECIDED
  home: { teamId: number; points: number } | null;
  away: { teamId: number; points: number } | null;
}

interface EspnSeasonJson {
  season: number;
  name: string;
  regularSeasonWeeks: number;
  playoffTeams: number;
  members: EspnMember[];
  teams: EspnTeam[];
  schedule: EspnMatchup[];
}

const SEASONS: EspnSeasonJson[] = [
  s2025,
  s2024,
  s2023,
  s2022,
  s2021,
  s2020,
  s2019,
  s2018,
  s2017,
];

export const ESPN_ERA = { first: 2017, last: 2025, leagueName: "Idiot Sandwich" };

// ---------- Per-season results ----------

export interface EspnSeason {
  season: number;
  playoffTeams: number;
  teams: Map<number, Team>;
  /** Final standings (ESPN's calculated final rank, playoffs included). */
  standings: Team[];
  champion: Team | null;
  runnerUp: Team | null;
  regularSeasonWinner: Team | null;
  lastPlace: Team | null;
  /** Completed regular-season games. */
  games: Game[];
}

function ownerName(member: EspnMember | undefined): string {
  if (!member) return "Unknown owner";
  const full = [member.firstName, member.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || member.displayName;
}

function buildSeason(json: EspnSeasonJson): EspnSeason {
  const membersById = new Map(json.members.map((m) => [m.id, m]));
  const teams = new Map<number, Team>();
  for (const t of json.teams) {
    const member = membersById.get(t.owners[0]);
    teams.set(t.id, {
      rosterId: t.id,
      ownerId: t.owners[0] ?? null,
      name: t.name.trim() || `Team ${t.abbrev}`,
      ownerName: ownerName(member),
      avatar: t.logo ?? null,
      wins: t.wins,
      losses: t.losses,
      ties: t.ties,
      pointsFor: t.pointsFor,
      pointsAgainst: t.pointsAgainst,
    });
  }

  const byRank = [...json.teams].sort((a, b) => a.finalRank - b.finalRank);
  const team = (e: EspnTeam | undefined) =>
    e ? (teams.get(e.id) ?? null) : null;

  const games: Game[] = [];
  let matchupId = 0;
  for (const m of json.schedule) {
    if (m.tier !== "NONE" || !m.home || !m.away || m.winner === "UNDECIDED")
      continue;
    games.push({
      week: m.week,
      matchupId: matchupId++,
      home: { rosterId: m.home.teamId, points: m.home.points },
      away: { rosterId: m.away.teamId, points: m.away.points },
    });
  }

  return {
    season: json.season,
    playoffTeams: json.playoffTeams,
    teams,
    standings: byRank.map((t) => teams.get(t.id)!),
    champion: team(byRank[0]),
    runnerUp: team(byRank[1]),
    regularSeasonWinner: team(json.teams.find((t) => t.playoffSeed === 1)),
    lastPlace: team(byRank[byRank.length - 1]),
    games,
  };
}

let cache: EspnSeason[] | null = null;

/** All ESPN-era seasons, newest first. */
export function getEspnSeasons(): EspnSeason[] {
  return (cache ??= SEASONS.map(buildSeason));
}

// ---------- All-time aggregation (mirrors lib/data's AllTimeData) ----------

export interface EspnGameRecord {
  season: number;
  week: number;
  team: Team;
  opponent: Team;
  points: number;
  opponentPoints: number;
}

export interface EspnAllTime {
  franchises: FranchiseRecord[];
  h2h: Map<string, Map<string, H2HCell>>;
  highGames: EspnGameRecord[];
  lowGames: EspnGameRecord[];
  blowouts: EspnGameRecord[];
  closest: EspnGameRecord[];
}

export function getEspnAllTime(): EspnAllTime {
  const seasons = getEspnSeasons();
  const franchises = new Map<string, FranchiseRecord>();
  const h2h = new Map<string, Map<string, H2HCell>>();
  const allGames: EspnGameRecord[] = [];

  const cell = (a: string, b: string): H2HCell => {
    let row = h2h.get(a);
    if (!row) h2h.set(a, (row = new Map()));
    let c = row.get(b);
    if (!c) row.set(b, (c = { wins: 0, losses: 0, ties: 0, pf: 0, pa: 0 }));
    return c;
  };

  // Oldest -> newest so the newest team name/logo wins.
  for (const season of [...seasons].reverse()) {
    for (const team of season.teams.values()) {
      if (!team.ownerId) continue;
      let f = franchises.get(team.ownerId);
      if (!f) {
        f = {
          ownerId: team.ownerId,
          name: team.name,
          ownerName: team.ownerName,
          avatar: team.avatar,
          seasons: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          championships: 0,
          highGame: null,
          lowGame: null,
        };
        franchises.set(team.ownerId, f);
      }
      f.name = team.name;
      f.ownerName = team.ownerName;
      f.avatar = team.avatar;
      f.seasons++;
      f.wins += team.wins;
      f.losses += team.losses;
      f.ties += team.ties;
      f.pointsFor += team.pointsFor;
      f.pointsAgainst += team.pointsAgainst;
    }
    if (season.champion?.ownerId) {
      const f = franchises.get(season.champion.ownerId);
      if (f) f.championships++;
    }

    for (const g of season.games) {
      const a = season.teams.get(g.home.rosterId);
      const b = season.teams.get(g.away.rosterId);
      if (!a?.ownerId || !b?.ownerId) continue;

      for (const [side, opp, sidePts, oppPts] of [
        [a, b, g.home.points, g.away.points],
        [b, a, g.away.points, g.home.points],
      ] as const) {
        const f = franchises.get(side.ownerId!);
        if (!f) continue;
        const entry = {
          points: sidePts,
          season: String(season.season),
          week: g.week,
        };
        if (!f.highGame || sidePts > f.highGame.points) f.highGame = entry;
        if (sidePts > 0 && (!f.lowGame || sidePts < f.lowGame.points))
          f.lowGame = entry;
        allGames.push({
          season: season.season,
          week: g.week,
          team: side,
          opponent: opp,
          points: sidePts,
          opponentPoints: oppPts,
        });
      }

      const ab = cell(a.ownerId, b.ownerId);
      const ba = cell(b.ownerId, a.ownerId);
      ab.pf += g.home.points;
      ab.pa += g.away.points;
      ba.pf += g.away.points;
      ba.pa += g.home.points;
      if (g.home.points === g.away.points) {
        ab.ties++;
        ba.ties++;
      } else if (g.home.points > g.away.points) {
        ab.wins++;
        ba.losses++;
      } else {
        ab.losses++;
        ba.wins++;
      }
    }
  }

  const list = [...franchises.values()].sort(
    (x, y) =>
      y.championships - x.championships ||
      y.wins / Math.max(1, y.wins + y.losses + y.ties) -
        x.wins / Math.max(1, x.wins + x.losses + x.ties) ||
      y.pointsFor - x.pointsFor,
  );

  const wins = allGames.filter((g) => g.points > g.opponentPoints);
  const margin = (g: EspnGameRecord) => g.points - g.opponentPoints;

  return {
    franchises: list,
    h2h,
    highGames: [...allGames].sort((a, b) => b.points - a.points).slice(0, 5),
    lowGames: [...allGames]
      .filter((g) => g.points > 0)
      .sort((a, b) => a.points - b.points)
      .slice(0, 5),
    blowouts: [...wins].sort((a, b) => margin(b) - margin(a)).slice(0, 5),
    closest: [...wins]
      .filter((g) => margin(g) > 0)
      .sort((a, b) => margin(a) - margin(b))
      .slice(0, 5),
  };
}
