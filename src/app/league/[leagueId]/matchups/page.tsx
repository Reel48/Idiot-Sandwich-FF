import Link from "next/link";
import { getLeague, getMatchups, getNflState } from "@/lib/sleeper/api";
import { getTeams, pairMatchups } from "@/lib/data";
import { Card, TeamLabel, fmtPts } from "@/components/ui";

export const revalidate = 300;

export default async function MatchupsPage({
  params,
  searchParams,
}: {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { leagueId } = await params;
  const { week: weekParam } = await searchParams;
  const [league, teams, nfl] = await Promise.all([
    getLeague(leagueId),
    getTeams(leagueId),
    getNflState(),
  ]);

  const maxWeek =
    league.status === "complete"
      ? 18
      : Math.min(18, Math.max(1, league.settings.leg || nfl.display_week || 1));
  const week = Math.min(
    Math.max(1, parseInt(weekParam ?? "", 10) || maxWeek),
    18,
  );

  const games = pairMatchups(
    week,
    await getMatchups(leagueId, week).catch(() => []),
  );
  const playoffStart = league.settings.playoff_week_start || 15;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: maxWeek }, (_, i) => i + 1).map((w) => (
          <Link
            key={w}
            href={`/league/${leagueId}/matchups?week=${w}`}
            className={`rounded-md px-2.5 py-1 font-mono text-sm ${
              w === week
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {w}
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold">
        Week {week}
        {week >= playoffStart && (
          <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
            Playoffs
          </span>
        )}
      </h2>

      {games.length === 0 ? (
        <Card>
          <p className="text-sm text-zinc-400">No matchups for this week.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {games.map((g) => {
            const home = teams.get(g.home.rosterId);
            const away = teams.get(g.away.rosterId);
            if (!home || !away) return null;
            const played = g.home.points > 0 || g.away.points > 0;
            const homeWins = played && g.home.points > g.away.points;
            const awayWins = played && g.away.points > g.home.points;
            const margin = Math.abs(g.home.points - g.away.points);
            return (
              <Card key={g.matchupId}>
                {[
                  { team: home, pts: g.home.points, win: homeWins },
                  { team: away, pts: g.away.points, win: awayWins },
                ].map(({ team, pts, win }) => (
                  <div
                    key={team.rosterId}
                    className={`flex items-center justify-between gap-3 py-1.5 ${
                      played && !win ? "opacity-70" : ""
                    }`}
                  >
                    <TeamLabel team={team} />
                    <span
                      className={`font-mono text-lg ${win ? "font-bold text-emerald-400" : ""}`}
                    >
                      {fmtPts(pts)}
                    </span>
                  </div>
                ))}
                {played && (
                  <p className="mt-1 border-t border-zinc-800 pt-2 text-xs text-zinc-500">
                    {margin === 0
                      ? "Tie game"
                      : `Margin: ${fmtPts(margin)} pts`}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
