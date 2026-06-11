// The two Sleeper league ids this site tracks, comma-separated in
// SLEEPER_LEAGUE_IDS (see .env.local). Each id is the current season's
// league — past seasons are discovered automatically by walking
// previous_league_id.
export const LEAGUE_IDS: string[] = (process.env.SLEEPER_LEAGUE_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const SITE_NAME = "Idiot Sandwich FF";
