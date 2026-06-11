import type {
  SleeperBracketMatch,
  SleeperDraft,
  SleeperDraftPick,
  SleeperLeague,
  SleeperMatchup,
  SleeperNflState,
  SleeperPlayer,
  SleeperRoster,
  SleeperTransaction,
  SleeperUser,
} from "./types";

const BASE = "https://api.sleeper.app/v1";

// Completed seasons never change, so historical data can be cached for a week.
export const LIVE = 300; // 5 min, for in-season data
export const HISTORICAL = 604800; // 7 days

async function get<T>(path: string, revalidate: number = LIVE): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`Sleeper API error ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

export const getNflState = () => get<SleeperNflState>(`/state/nfl`, LIVE);

export const getLeague = (leagueId: string) =>
  get<SleeperLeague>(`/league/${leagueId}`, 3600);

export const getRosters = (leagueId: string, revalidate?: number) =>
  get<SleeperRoster[]>(`/league/${leagueId}/rosters`, revalidate);

export const getUsers = (leagueId: string, revalidate?: number) =>
  get<SleeperUser[]>(`/league/${leagueId}/users`, revalidate ?? 3600);

export const getMatchups = (
  leagueId: string,
  week: number,
  revalidate?: number,
) => get<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`, revalidate);

export const getWinnersBracket = (leagueId: string, revalidate?: number) =>
  get<SleeperBracketMatch[]>(`/league/${leagueId}/winners_bracket`, revalidate);

export const getLosersBracket = (leagueId: string, revalidate?: number) =>
  get<SleeperBracketMatch[]>(`/league/${leagueId}/losers_bracket`, revalidate);

export const getTransactions = (
  leagueId: string,
  week: number,
  revalidate?: number,
) =>
  get<SleeperTransaction[]>(
    `/league/${leagueId}/transactions/${week}`,
    revalidate,
  );

export const getDrafts = (leagueId: string) =>
  get<SleeperDraft[]>(`/league/${leagueId}/drafts`, HISTORICAL);

export const getDraftPicks = (draftId: string) =>
  get<SleeperDraftPick[]>(`/draft/${draftId}/picks`, HISTORICAL);

// ~5MB payload; Sleeper asks that this be fetched at most once per day.
export const getAllPlayers = () =>
  get<Record<string, SleeperPlayer>>(`/players/nfl`, 86400);

export function avatarUrl(avatar: string | null | undefined, thumb = true) {
  if (!avatar) return null;
  return `https://sleepercdn.com/avatars/${thumb ? "thumbs/" : ""}${avatar}`;
}
