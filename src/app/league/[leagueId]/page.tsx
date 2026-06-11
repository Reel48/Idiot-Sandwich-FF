import Link from "next/link";
import { getLeague, getMatchups, getNflState } from "@/lib/sleeper/api";
import {
  computeWeekAwards,
  getSeasonGames,
  getTeams,
  lastCompletedWeek,
  pairMatchups,
  sortStandings,
} from "@/lib/data";
import { Card, TeamLabel, fmtPts, record } from "@/components/ui";

export const revalidate = 300;

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
  const standings = sortStandings([...teams.values()]);

  const currentWeek = Math.min(
    Math.max(1, league.settings.leg || nfl.display_week || 1),
    18,
  );
  const games = pairMatchups(
    currentWeek,
    await getMatchups(leagueId, currentWeek).catch(() => []),
  );

  const completed = lastCompletedWeek(league, nfl.week);
  const seasonGames = await getSeasonGames(league, completed);
  const awards =
    completed >= 1 ? computeWeekAwards(completed, seasonGames, teams) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card title="Standings" className="lg:col-span-3">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="pb-2 pr-2">#</th>
              <th className="pb-2">Team</th>
              <th className="pb-2 text-right">Record</th>
              <th className="pb-2 text-right">PF</th>
              <th className="pb-2 text-right hidden sm:table-cell">PA</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t, i) => (
              <tr key={t.rosterId} className="border-t border-zinc-800/70">
                <td className="py-2 pr-2 font-mono text-zinc-500">{i + 1}</td>
                <td className="py-2">
                  <TeamLabel team={t} />
                </td>
                <td className="py-2 text-right font-mono">{record(t)}</td>
                <td className="py-2 text-right font-mono">
                  {fmtPts(t.pointsFor)}
                </td>
                <td className="py-2 text-right font-mono text-zinc-400 hidden sm:table-cell">
                  {fmtPts(t.pointsAgainst)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="space-y-6 lg:col-span-2">
        <Card title={`Week ${currentWeek} Scoreboard`}>
          {games.length === 0 ? (
            <p className="text-sm text-zinc-400">No matchups yet.</p>
          ) : (
            <ul className="space-y-3">
              {games.map((g) => {
                const home = teams.get(g.home.rosterId);
                const away = teams.get(g.away.rosterId);
                if (!home || !away) return null;
                const homeWins = g.home.points > g.away.points;
                const awayWins = g.away.points > g.home.points;
                return (
                  <li
                    key={g.matchupId}
                    className="rounded-lg bg-zinc-800/50 px-3 py-2"
                  >
                    {[
                      { team: home, pts: g.home.points, win: homeWins },
                      { team: away, pts: g.away.points, win: awayWins },
                    ].map(({ team, pts, win }) => (
                      <div
                        key={team.rosterId}
                        className="flex items-center justify-between gap-2 py-0.5"
                      >
                        <span
                          className={`truncate text-sm ${win ? "font-semibold" : "text-zinc-300"}`}
                        >
                          {team.name}
                        </span>
                        <span
                          className={`font-mono text-sm ${win ? "text-emerald-400" : "text-zinc-400"}`}
                        >
                          {fmtPts(pts)}
                        </span>
                      </div>
                    ))}
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href={`/league/${leagueId}/matchups`}
            className="mt-3 block text-sm font-medium text-emerald-400"
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
                  {awards.highScore.team.name} ({fmtPts(awards.highScore.points)})
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
              className="mt-3 block text-sm font-medium text-emerald-400"
            >
              All awards →
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
