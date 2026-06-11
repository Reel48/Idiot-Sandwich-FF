// Types for the Sleeper public API (https://docs.sleeper.com)

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string; // e.g. "2025"
  status: "pre_draft" | "drafting" | "in_season" | "complete";
  sport: string;
  total_rosters: number;
  previous_league_id: string | null;
  draft_id: string | null;
  avatar: string | null;
  settings: {
    playoff_week_start: number;
    num_teams?: number;
    leg?: number; // current week
    last_scored_leg?: number;
    playoff_teams?: number;
    [key: string]: number | undefined;
  };
  scoring_settings: Record<string, number>;
  roster_positions: string[];
  metadata?: Record<string, string> | null;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string | null;
  co_owners?: string[] | null;
  league_id: string;
  players: string[] | null;
  starters: string[] | null;
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal?: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
    waiver_budget_used?: number;
    [key: string]: number | undefined;
  };
  metadata?: Record<string, string> | null;
}

export interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar: string | null;
  metadata?: {
    team_name?: string;
    [key: string]: string | undefined;
  } | null;
  is_owner?: boolean;
}

export interface SleeperMatchup {
  matchup_id: number | null;
  roster_id: number;
  points: number;
  custom_points?: number | null;
  players: string[] | null;
  starters: string[] | null;
  starters_points?: number[] | null;
  players_points?: Record<string, number> | null;
}

// Playoff bracket entry. `t1`/`t2` are roster ids (or objects pointing at a
// previous match before teams are decided), `w`/`l` the winner/loser roster
// ids once played, `p` the place the match decides (1 = championship).
export interface SleeperBracketMatch {
  r: number; // round
  m: number; // match id
  t1: number | { w?: number; l?: number } | null;
  t2: number | { w?: number; l?: number } | null;
  w: number | null;
  l: number | null;
  p?: number;
  t1_from?: { w?: number; l?: number };
  t2_from?: { w?: number; l?: number };
}

export interface SleeperNflState {
  week: number;
  display_week: number;
  season: string;
  season_type: "pre" | "regular" | "post" | "off";
  league_season: string;
  previous_season: string;
}

export interface SleeperTransaction {
  transaction_id: string;
  type: "trade" | "free_agent" | "waiver";
  status: string;
  roster_ids: number[];
  adds: Record<string, number> | null; // player_id -> roster_id
  drops: Record<string, number> | null;
  draft_picks: {
    season: string;
    round: number;
    roster_id: number;
    previous_owner_id: number;
    owner_id: number;
  }[];
  waiver_budget: { sender: number; receiver: number; amount: number }[];
  creator: string;
  created: number;
  leg: number; // week
}

export interface SleeperDraft {
  draft_id: string;
  league_id: string;
  season: string;
  status: string;
  type: string;
  start_time: number | null;
  settings: Record<string, number>;
  draft_order: Record<string, number> | null; // user_id -> pick slot
}

export interface SleeperDraftPick {
  player_id: string;
  picked_by: string; // user_id
  roster_id: number;
  round: number;
  pick_no: number;
  draft_slot: number;
  metadata: {
    first_name?: string;
    last_name?: string;
    position?: string;
    team?: string;
  };
}

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  position: string | null;
  team: string | null;
  fantasy_positions: string[] | null;
}
