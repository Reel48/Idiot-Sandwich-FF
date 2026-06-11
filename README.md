# Idiot Sandwich FF 🥪🏈

A website for tracking two Sleeper fantasy football leagues — standings, weekly
matchups, power rankings, full league history, all-time records, head-to-head
grids, and weekly awards. All data is pulled live from the public
[Sleeper API](https://docs.sleeper.com); past seasons are discovered
automatically by walking each league's `previous_league_id` chain.

## Setup

1. Copy `.env.example` to `.env.local` and set your league ids:

   ```
   SLEEPER_LEAGUE_IDS=123456789012345678,876543210987654321
   ```

   Use the **current season's** league id for each league (the long number in
   the Sleeper league URL). History is found automatically.

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open http://localhost:3000.

## Pages

- **Home** — both leagues at a glance
- **Dashboard** — standings + this week's scoreboard + latest awards
- **Matchups** — any week, playoff weeks flagged
- **Power Rankings** — composite of all-play record, actual record, season scoring, and recent form
- **History** — every linked season with champion, runner-up, and final standings
- **Records** — all-time franchise records and the head-to-head grid
- **Awards** — weekly superlatives (top score, stinker, blowout, nail-biter, toughest beat, luckiest win)

## Deploying

Deploys cleanly to Vercel. Set `SLEEPER_LEAGUE_IDS` in the project's
environment variables. No database or auth needed — the Sleeper API is public
and read-only, and pages revalidate on a 5-minute/1-hour cadence.
