import Link from "next/link";
import { getLeague, getMatchups, getNflState } from "@/lib/sleeper/api";
import type { SleeperLeague } from "@/lib/sleeper/types";
import {
  computeWeekAwards,
  getReigningChampion,
  getSeasonGames,
  getTeams,
  lastCompletedWeek,
  pairMatchups,
  seasonPhase,
  sortStandings,
  type Team,
} from "@/lib/data";
import { Card, EmptyState, TeamLabel, fmtPts } from "@/components/ui";
import { ChampBanner, ShameBanner } from "@/components/banners";
import { StandingsTable } from "@/components/standings";

export const revalidate = 300;

function QuickLink({
  href,
  emoji,
  label,
  sub,
}: {
  href: string;
  emoji: string;
  label: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-edge bg-surface-2 px-3 py-2.5 transition-colors hover:border-edge-strong hover:bg-surface-3"
    >
      <span className="block text-sm font-semibold">
        {emoji} {label}
      </span>
      <span className="block text-xs text-zinc-500">{sub}</span>
    </Link>
  );
}

async function OffseasonDashboard({
  league,
  teams,
}: {
  league: SleeperLeague;
  teams: Map<number, Team>;
}) {
  const lastSeason = await getReigningChampion(league.league_id);
  const base = `/league/${league.league_id}`;

  if (!lastSeason) {
    // Brand-new league: no history to recap yet.
    const roster = sortStandings([...teams.values()]);
    return (
      <div className="space-y-6">
        <Card>
          <EmptyState
            title="New league, no skeletons in the closet yet."
            hint={`The ${league.season} draft hasn't happened. Talk your talk now — it's all downhill from here.`}
          />
        </Card>
        <Card title={`The contenders (${roster.length} teams)`}>
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {roster.map((t) => (
              <li key={t.rosterId}>
                <TeamLabel team={t} size={32} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }

  const { league: prevLeague, standings, champion, lastPlace } = lastSeason;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {champion && (
            <ChampBanner team={champion} season={prevLeague.season} />
          )}
        </div>
        <div className="lg:col-span-2">
          {lastPlace && (
            <ShameBanner team={lastPlace} season={prevLeague.season} />
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickLink
          href={`${base}/history`}
          emoji="📜"
          label="History"
          sub="Every season, every champ"
        />
        <QuickLink
          href={`${base}/records`}
          emoji="🧾"
          label="Records"
          sub="The all-time receipts"
        />
        <QuickLink
          href={`${base}/awards`}
          emoji="🏅"
          label="Awards"
          sub="Relive the carnage"
        />
      </div>

      <Card title={`Final standings — ${prevLeague.season}`}>
        <StandingsTable
          teams={standings}
          champRosterId={champion?.rosterId}
        />
      </Card>
    </div>
  );
}

export default async function LeagueDashboard({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const [league, teams, nfl] = await Promise.all([
    getLeague(leagueId),
    getTeams(leagueId),
    getNflState(),
  ]);

  if (seasonPhase(league, nfl.week) === "pre") {
    return <OffseasonDashboard league={league} teams={teams} />;
  }

  const standings = sortStandings([...teams.values()]);
  const currentWeek = Math.min(
    Math.max(1, league.settings.leg || nfl.display_week || 1),
    18,
  );
  const completed = lastCompletedWeek(league, nfl.week);
  const [games, seasonGames] = await Promise.all([
    getMatchups(leagueId, currentWeek)
      .then((m) => pairMatchups(currentWeek, m))
      .catch(() => []),
    getSeasonGames(league, completed),
  ]);
  const awards =
    completed >= 1 ? computeWeekAwards(completed, seasonGames, teams) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card title="Standings" className="lg:col-span-3">
        <StandingsTable
          teams={standings}
          playoffTeams={league.settings.playoff_teams}
        />
      </Card>

      <div className="space-y-6 lg:col-span-2">
        <Card title={`Week ${currentWeek} Scoreboard`}>
          {games.length === 0 ? (
            <EmptyState
              title="Nothing's cooking yet."
              hint="Matchups show up here once the week is set."
            />
          ) : (
            <ul className="space-y-3">
              {games.map((g) => {
                const home = teams.get(g.home.rosterId);
                const away = teams.get(g.away.rosterId);
                if (!home || !away) return null;
                const homeWins = g.home.points > g.away.points;
                const awayWins = g.away.points > g.home.points;
                return (
                  <li key={g.matchupId}>
                    <Link
                      href={`/league/${leagueId}/matchups?week=${currentWeek}`}
                      className="block rounded-lg border border-edge bg-surface-2 px-3 py-2 transition-colors hover:border-edge-strong"
                    >
                      {[
                        { team: home, pts: g.home.points, win: homeWins },
                        { team: away, pts: g.away.points, win: awayWins },
                      ].map(({ team, pts, win }) => (
                        <div
                          key={team.rosterId}
                          className={`flex items-center justify-between gap-2 py-0.5 ${
                            win ? "border-l-2 border-accent pl-2 -ml-2" : ""
                          }`}
                        >
                          <span
                            className={`truncate text-sm ${win ? "font-semibold" : "text-zinc-400"}`}
                          >
                            {team.name}
                          </span>
                          <span
                            className={`font-mono text-sm ${win ? "text-accent" : "text-zinc-500"}`}
                          >
                            {fmtPts(pts)}
                          </span>
                        </div>
                      ))}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href={`/league/${leagueId}/matchups`}
            className="mt-3 block text-sm font-medium text-accent hover:underline"
          >
            All matchups →
          </Link>
        </Card>

        {awards && (
          <Card title={`Week ${awards.week} Awards`}>
            <ul className="space-y-2 text-sm">
              {awards.highScore && (
                <li>
                  🔥 <span className="font-medium">Top score:</span>{" "}
                  {awards.highScore.team.name} (
                  {fmtPts(awards.highScore.points)})
                </li>
              )}
              {awards.lowScore && (
                <li>
                  🥶 <span className="font-medium">Stinker:</span>{" "}
                  {awards.lowScore.team.name} ({fmtPts(awards.lowScore.points)})
                </li>
              )}
              {awards.biggestBlowout && (
                <li>
                  💥 <span className="font-medium">Blowout:</span>{" "}
                  {awards.biggestBlowout.winner.name} over{" "}
                  {awards.biggestBlowout.loser.name} by{" "}
                  {fmtPts(awards.biggestBlowout.margin)}
                </li>
              )}
              {awards.closestGame && (
                <li>
                  😅 <span className="font-medium">Nail-biter:</span>{" "}
                  {awards.closestGame.winner.name} edged{" "}
                  {awards.closestGame.loser.name} by{" "}
                  {fmtPts(awards.closestGame.margin)}
                </li>
              )}
            </ul>
            <Link
              href={`/league/${leagueId}/awards`}
              className="mt-3 block text-sm font-medium text-accent hover:underline"
            >
              All awards →
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
