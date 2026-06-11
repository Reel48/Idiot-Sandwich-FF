import { getLeague, getNflState } from "@/lib/sleeper/api";
import {
  computePowerRankings,
  getSeasonGames,
  getTeams,
  lastCompletedWeek,
} from "@/lib/data";
import { Card, TeamLabel, fmtPts, record } from "@/components/ui";

export const revalidate = 300;

function Trend({ value }: { value: number }) {
  if (value > 0)
    return <span className="font-mono text-emerald-400">▲ rising</span>;
  if (value < 0) return <span className="font-mono text-red-400">▼ cooling</span>;
  return <span className="font-mono text-zinc-500">—</span>;
}

export default async function PowerRankingsPage({
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
  const completed = lastCompletedWeek(league, nfl.week);
  const games = await getSeasonGames(league, completed);
  const rankings = computePowerRankings(teams, games);
  const maxScore = Math.max(1, ...rankings.map((r) => r.score));

  if (!games.length) {
    return (
      <Card>
        <p className="text-sm text-zinc-400">
          Power rankings appear once the season has at least one completed
          week.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Composite of all-play record (35%), actual record (30%), season scoring
        (20%), and last-3-weeks form (15%), through week {Math.min(completed, (league.settings.playoff_week_start || 15) - 1)}.
      </p>
      <div className="space-y-3">
        {rankings.map((r) => (
          <Card key={r.team.rosterId}>
            <div className="flex items-center gap-4">
              <span className="w-8 text-center font-mono text-2xl font-bold text-zinc-500">
                {r.rank}
              </span>
              <div className="min-w-0 flex-1">
                <TeamLabel team={r.team} size={36} />
              </div>
              <div className="hidden gap-6 text-right text-sm sm:flex">
                <div>
                  <div className="text-xs text-zinc-500">Record</div>
                  <div className="font-mono">{record(r.team)}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">All-play</div>
                  <div className="font-mono">
                    {r.allPlayWins}-{r.allPlayLosses}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Avg pts</div>
                  <div className="font-mono">{fmtPts(r.avgPoints)}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Last 3</div>
                  <div className="font-mono">{fmtPts(r.recentAvg)}</div>
                </div>
                <div className="w-20">
                  <div className="text-xs text-zinc-500">Trend</div>
                  <Trend value={r.trend} />
                </div>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${(r.score / maxScore) * 100}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
