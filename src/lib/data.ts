import {
  HISTORICAL,
  LIVE,
  getLeague,
  getMatchups,
  getNflState,
  getRosters,
  getUsers,
  getWinnersBracket,
} from "./sleeper/api";
import type {
  SleeperBracketMatch,
  SleeperLeague,
  SleeperMatchup,
  SleeperRoster,
  SleeperUser,
} from "./sleeper/types";

// ---------- Teams ----------

export interface Team {
  rosterId: number;
  ownerId: string | null;
  name: string; // team name, falling back to display name
  ownerName: string;
  avatar: string | null;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
}

export function buildTeams(
  rosters: SleeperRoster[],
  users: SleeperUser[],
): Map<number, Team> {
  const usersById = new Map(users.map((u) => [u.user_id, u]));
  const teams = new Map<number, Team>();
  for (const r of rosters) {
    const user = r.owner_id ? usersById.get(r.owner_id) : undefined;
    const s = r.settings;
    teams.set(r.roster_id, {
      rosterId: r.roster_id,
      ownerId: r.owner_id,
      name:
        user?.metadata?.team_name ||
        user?.display_name ||
        `Team ${r.roster_id}`,
      ownerName: user?.display_name ?? "Open team",
      avatar: user?.avatar ?? null,
      wins: s.wins ?? 0,
      losses: s.losses ?? 0,
      ties: s.ties ?? 0,
      pointsFor: (s.fpts ?? 0) + (s.fpts_decimal ?? 0) / 100,
      pointsAgainst:
        (s.fpts_against ?? 0) + (s.fpts_against_decimal ?? 0) / 100,
    });
  }
  return teams;
}

export async function getTeams(leagueId: string, revalidate?: number) {
  const [rosters, users] = await Promise.all([
    getRosters(leagueId, revalidate),
    getUsers(leagueId, revalidate),
  ]);
  return buildTeams(rosters, users);
}

export function sortStandings(teams: Team[]): Team[] {
  return [...teams].sort(
    (a, b) =>
      b.wins - a.wins ||
      a.losses - b.losses ||
      b.pointsFor - a.pointsFor,
  );
}

// ---------- Matchups / games ----------

export interface Game {
  week: number;
  matchupId: number;
  home: { rosterId: number; points: number };
  away: { rosterId: number; points: number };
}

export function pairMatchups(week: number, raw: SleeperMatchup[]): Game[] {
  const byId = new Map<number, SleeperMatchup[]>();
  for (const m of raw) {
    if (m.matchup_id == null) continue; // bye / median weeks
    const list = byId.get(m.matchup_id) ?? [];
    list.push(m);
    byId.set(m.matchup_id, list);
  }
  const games: Game[] = [];
  for (const [matchupId, pair] of byId) {
    if (pair.length !== 2) continue;
    const [a, b] = pair;
    games.push({
      week,
      matchupId,
      home: { rosterId: a.roster_id, points: a.points ?? 0 },
      away: { rosterId: b.roster_id, points: b.points ?? 0 },
    });
  }
  return games.sort((a, b) => a.matchupId - b.matchupId);
}

/** Last week with completed games for a league (0 if season hasn't started). */
export function lastCompletedWeek(league: SleeperLeague, nflWeek: number) {
  if (league.status === "complete") return 18;
  const lastScored = league.settings.last_scored_leg;
  if (lastScored != null) return lastScored;
  return Math.max(0, nflWeek - 1);
}

/** All completed regular-season games for one league season. */
export async function getSeasonGames(
  league: SleeperLeague,
  throughWeek: number,
): Promise<Game[]> {
  const lastWeek = Math.min(
    throughWeek,
    (league.settings.playoff_week_start || 15) - 1,
  );
  if (lastWeek < 1) return [];
  const revalidate = league.status === "complete" ? HISTORICAL : LIVE;
  const weeks = Array.from({ length: lastWeek }, (_, i) => i + 1);
  const all = await Promise.all(
    weeks.map(async (w) => pairMatchups(w, await getMatchups(league.league_id, w, revalidate))),
  );
  return all.flat();
}

// ---------- Season phase ----------

export type SeasonPhase = "pre" | "live" | "done";

/** Whether a season hasn't started, is underway, or is final. */
export function seasonPhase(
  league: SleeperLeague,
  nflWeek: number,
): SeasonPhase {
  if (league.status === "complete") return "done";
  if (league.status === "pre_draft" || league.status === "drafting")
    return "pre";
  return lastCompletedWeek(league, nflWeek) === 0 ? "pre" : "live";
}

// ---------- League history chain ----------

const MAX_SEASONS = 20;

/** Current league plus all linked past seasons, newest first. */
export async function getLeagueChain(
  leagueId: string,
): Promise<SleeperLeague[]> {
  const chain: SleeperLeague[] = [];
  let id: string | null = leagueId;
  while (id && id !== "0" && chain.length < MAX_SEASONS) {
    const league: SleeperLeague = await getLeague(id);
    chain.push(league);
    id = league.previous_league_id;
  }
  return chain;
}

// ---------- Champions ----------

export interface SeasonResult {
  league: SleeperLeague;
  teams: Map<number, Team>;
  standings: Team[];
  champion: Team | null;
  runnerUp: Team | null;
  regularSeasonWinner: Team | null;
  lastPlace: Team | null;
}

function bracketFinal(bracket: SleeperBracketMatch[]) {
  // The championship match decides place 1; fall back to the last round.
  const final =
    bracket.find((m) => m.p === 1) ??
    [...bracket].sort((a, b) => b.r - a.r || a.m - b.m)[0];
  return final ?? null;
}

export async function getSeasonResult(
  league: SleeperLeague,
): Promise<SeasonResult> {
  const complete = league.status === "complete";
  const revalidate = complete ? HISTORICAL : LIVE;
  const [teams, bracket] = await Promise.all([
    getTeams(league.league_id, revalidate),
    complete
      ? getWinnersBracket(league.league_id, revalidate).catch(() => [])
      : Promise.resolve([] as SleeperBracketMatch[]),
  ]);
  const standings = sortStandings([...teams.values()]);
  let champion: Team | null = null;
  let runnerUp: Team | null = null;
  if (complete && bracket.length) {
    const final = bracketFinal(bracket);
    if (final?.w != null) champion = teams.get(final.w) ?? null;
    if (final?.l != null) runnerUp = teams.get(final.l) ?? null;
  }
  return {
    league,
    teams,
    standings,
    champion,
    runnerUp,
    regularSeasonWinner: standings[0] ?? null,
    lastPlace: standings[standings.length - 1] ?? null,
  };
}

/** Most recent completed season's result in a league's chain (null for a
 *  league with no finished seasons). */
export async function getReigningChampion(
  leagueId: string,
): Promise<SeasonResult | null> {
  const chain = await getLeagueChain(leagueId);
  const lastDone = chain.find((l) => l.status === "complete");
  return lastDone ? getSeasonResult(lastDone) : null;
}

// ---------- Power rankings ----------

export interface PowerRanking {
  team: Team;
  rank: number;
  score: number; // 0-100 composite
  allPlayWins: number;
  allPlayLosses: number;
  avgPoints: number;
  recentAvg: number; // last 3 weeks
  trend: number; // overall rank minus recent-form rank (positive = recent form better = rising)
}

export function computePowerRankings(
  teams: Map<number, Team>,
  games: Game[],
): PowerRanking[] {
  const weeks = new Map<number, { rosterId: number; points: number }[]>();
  for (const g of games) {
    const list = weeks.get(g.week) ?? [];
    list.push(g.home, g.away);
    weeks.set(g.week, list);
  }

  interface Acc {
    allPlayW: number;
    allPlayL: number;
    points: number[];
  }
  const acc = new Map<number, Acc>();
  for (const id of teams.keys())
    acc.set(id, { allPlayW: 0, allPlayL: 0, points: [] });

  for (const scores of weeks.values()) {
    for (const s of scores) {
      const a = acc.get(s.rosterId);
      if (!a) continue;
      a.points.push(s.points);
      for (const o of scores) {
        if (o.rosterId === s.rosterId) continue;
        if (s.points > o.points) a.allPlayW++;
        else if (s.points < o.points) a.allPlayL++;
      }
    }
  }

  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((t, x) => t + x, 0) / xs.length : 0;

  const rows = [...teams.values()].map((team) => {
    const a = acc.get(team.rosterId)!;
    const gamesPlayed = team.wins + team.losses + team.ties;
    const winPct = gamesPlayed ? (team.wins + team.ties / 2) / gamesPlayed : 0;
    const allPlayTotal = a.allPlayW + a.allPlayL;
    const allPlayPct = allPlayTotal ? a.allPlayW / allPlayTotal : 0;
    return {
      team,
      allPlayWins: a.allPlayW,
      allPlayLosses: a.allPlayL,
      avgPoints: avg(a.points),
      recentAvg: avg(a.points.slice(-3)),
      winPct,
      allPlayPct,
    };
  });

  const maxAvg = Math.max(1, ...rows.map((r) => r.avgPoints));
  const scored = rows.map((r) => ({
    ...r,
    score:
      100 *
      (0.35 * r.allPlayPct +
        0.3 * r.winPct +
        0.2 * (r.avgPoints / maxAvg) +
        0.15 * (maxAvg ? r.recentAvg / maxAvg : 0)),
  }));

  const byRecent = [...scored].sort((a, b) => b.recentAvg - a.recentAvg);
  const recentRank = new Map(byRecent.map((r, i) => [r.team.rosterId, i + 1]));

  return scored
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({
      team: r.team,
      rank: i + 1,
      score: r.score,
      allPlayWins: r.allPlayWins,
      allPlayLosses: r.allPlayLosses,
      avgPoints: r.avgPoints,
      recentAvg: r.recentAvg,
      trend: i + 1 - (recentRank.get(r.team.rosterId) ?? i + 1),
    }));
}

// ---------- Weekly awards ----------

export interface WeekAwards {
  week: number;
  highScore: { team: Team; points: number } | null;
  lowScore: { team: Team; points: number } | null;
  biggestBlowout: { winner: Team; loser: Team; margin: number } | null;
  closestGame: { winner: Team; loser: Team; margin: number } | null;
  bestLoss: { team: Team; points: number } | null; // highest score in a loss
  worstWin: { team: Team; points: number } | null; // lowest score in a win
}

export function computeWeekAwards(
  week: number,
  games: Game[],
  teams: Map<number, Team>,
): WeekAwards | null {
  const weekGames = games.filter((g) => g.week === week);
  if (!weekGames.length) return null;
  const t = (id: number) => teams.get(id)!;

  let high: { team: Team; points: number } | null = null;
  let low: { team: Team; points: number } | null = null;
  let blowout: WeekAwards["biggestBlowout"] = null;
  let closest: WeekAwards["closestGame"] = null;
  let bestLoss: WeekAwards["bestLoss"] = null;
  let worstWin: WeekAwards["worstWin"] = null;

  for (const g of weekGames) {
    for (const side of [g.home, g.away]) {
      if (!teams.has(side.rosterId)) continue;
      if (!high || side.points > high.points)
        high = { team: t(side.rosterId), points: side.points };
      if (!low || side.points < low.points)
        low = { team: t(side.rosterId), points: side.points };
    }
    const [w, l] =
      g.home.points >= g.away.points ? [g.home, g.away] : [g.away, g.home];
    if (!teams.has(w.rosterId) || !teams.has(l.rosterId)) continue;
    const margin = w.points - l.points;
    if (margin === 0) continue; // tie
    if (!blowout || margin > blowout.margin)
      blowout = { winner: t(w.rosterId), loser: t(l.rosterId), margin };
    if (!closest || margin < closest.margin)
      closest = { winner: t(w.rosterId), loser: t(l.rosterId), margin };
    if (!bestLoss || l.points > bestLoss.points)
      bestLoss = { team: t(l.rosterId), points: l.points };
    if (!worstWin || w.points < worstWin.points)
      worstWin = { team: t(w.rosterId), points: w.points };
  }

  return {
    week,
    highScore: high,
    lowScore: low,
    biggestBlowout: blowout,
    closestGame: closest,
    bestLoss,
    worstWin,
  };
}

// ---------- All-time / head-to-head (across the league chain) ----------

export interface FranchiseRecord {
  ownerId: string;
  name: string; // most recent team name
  ownerName: string;
  avatar: string | null;
  seasons: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  championships: number;
  highGame: { points: number; season: string; week: number } | null;
  lowGame: { points: number; season: string; week: number } | null;
}

export interface H2HCell {
  wins: number;
  losses: number;
  ties: number;
}

export interface AllTimeData {
  franchises: FranchiseRecord[];
  // ownerId -> opponent ownerId -> record from the row-owner's perspective
  h2h: Map<string, Map<string, H2HCell>>;
  seasons: SeasonResult[]; // newest first
}

export async function getAllTimeData(leagueId: string): Promise<AllTimeData> {
  const [chain, nfl] = await Promise.all([getLeagueChain(leagueId), getNflState()]);
  const seasons = await Promise.all(chain.map((l) => getSeasonResult(l)));

  const franchises = new Map<string, FranchiseRecord>();
  const h2h = new Map<string, Map<string, H2HCell>>();

  const cell = (a: string, b: string): H2HCell => {
    let row = h2h.get(a);
    if (!row) h2h.set(a, (row = new Map()));
    let c = row.get(b);
    if (!c) row.set(b, (c = { wins: 0, losses: 0, ties: 0 }));
    return c;
  };

  // Walk oldest -> newest so the newest team name wins.
  for (const season of [...seasons].reverse()) {
    const { league, teams } = season;
    const games = await getSeasonGames(
      league,
      lastCompletedWeek(league, nfl.week),
    );

    for (const team of teams.values()) {
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

    for (const g of games) {
      const a = teams.get(g.home.rosterId);
      const b = teams.get(g.away.rosterId);
      if (!a?.ownerId || !b?.ownerId) continue;

      for (const [team, side] of [
        [a, g.home],
        [b, g.away],
      ] as const) {
        const f = franchises.get(team.ownerId!);
        if (!f) continue;
        const entry = { points: side.points, season: league.season, week: g.week };
        if (!f.highGame || side.points > f.highGame.points) f.highGame = entry;
        if (side.points > 0 && (!f.lowGame || side.points < f.lowGame.points))
          f.lowGame = entry;
      }

      if (g.home.points === g.away.points) {
        cell(a.ownerId, b.ownerId).ties++;
        cell(b.ownerId, a.ownerId).ties++;
      } else if (g.home.points > g.away.points) {
        cell(a.ownerId, b.ownerId).wins++;
        cell(b.ownerId, a.ownerId).losses++;
      } else {
        cell(a.ownerId, b.ownerId).losses++;
        cell(b.ownerId, a.ownerId).wins++;
      }
    }
  }

  const list = [...franchises.values()].sort(
    (x, y) =>
      y.championships - x.championships ||
      (y.wins / Math.max(1, y.wins + y.losses + y.ties)) -
        (x.wins / Math.max(1, x.wins + x.losses + x.ties)) ||
      y.pointsFor - x.pointsFor,
  );

  return { franchises: list, h2h, seasons };
}
