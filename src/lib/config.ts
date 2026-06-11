// The two Sleeper league ids this site tracks. Each id is the current
// season's league — past seasons are discovered automatically by walking
// previous_league_id. Override with a comma-separated SLEEPER_LEAGUE_IDS
// env var (e.g. when a new season's league is created).
const DEFAULT_LEAGUE_IDS = [
  "1370897736768970752", // Idiot Sandwich Regular (redraft)
  "1319722787354456064", // Idiot Sandwich (dynasty)
];

const fromEnv = (process.env.SLEEPER_LEAGUE_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const LEAGUE_IDS: string[] = fromEnv.length
  ? fromEnv
  : DEFAULT_LEAGUE_IDS;

export const SITE_NAME = "Idiot Sandwich FF";

// Short display names for the site, keyed by the league's name on Sleeper
// (covers past seasons in each league's chain too).
const LEAGUE_NAME_OVERRIDES: Record<string, string> = {
  "Idiot Sandwich Regular": "Regular",
  "Idiot Sandwich": "Dynasty",
};

export function displayLeagueName(sleeperName: string): string {
  return LEAGUE_NAME_OVERRIDES[sleeperName] ?? sleeperName;
}
