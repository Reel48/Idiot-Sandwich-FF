import { getLeague, getNflState } from "@/lib/sleeper/api";
import {
  computePowerRankings,
  getSeasonGames,
  getTeams,
  lastCompletedWeek,
} from "@/lib/data";
import {
  Card,
  EmptyState,
  PageHeader,
  RankBadge,
  TeamLabel,
  fmtPts,
  record,
} from "@/components/ui";

export const revalidate = 300;

function TrendChip({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-xs text-accent">
        ▲ rising
      </span>
    );
  if (value < 0)
    return (
      <span className="rounded-full bg-shame/10 px-2 py-0.5 font-mono text-xs text-shame">
        ▼ cooling
      </span>
    );
  return (
    <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-xs text-zinc-500">
      — steady
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-2 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="font-mono text-sm tabular-nums">{value}</div>
    </div>
  );
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

  if (!games.length) {
    return (
      <Card>
        <EmptyState
          emoji="📊"
          title="Power rankings need at least one week of games."
          hint="Come back after kickoff — someone will be overrated by then."
        />
      </Card>
    );
  }

  const rankings = computePowerRankings(teams, games);
  const maxScore = Math.max(1, ...rankings.map((r) => r.score));
  const throughWeek = Math.min(
    completed,
    (league.settings.playoff_week_start || 15) - 1,
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Power Rankings"
        subtitle={`All-play record (35%) + actual record (30%) + season scoring (20%) + last-3-weeks form (15%), through week ${throughWeek}.`}
      />
      <div className="space-y-3">
        {rankings.map((r) => {
          const isLast = r.rank === rankings.length;
          return (
            <Card key={r.team.rosterId} className="hover:border-edge-strong">
              <div className="flex items-center gap-3 sm:gap-4">
                <RankBadge rank={r.rank} total={rankings.length} />
                <div className="min-w-0 flex-1">
                  <TeamLabel team={r.team} size={36} />
                </div>
                <div className="hidden items-center gap-6 text-right text-sm lg:flex">
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
                </div>
                <TrendChip value={r.trend} />
              </div>

              {/* Mobile/tablet stats — always visible, never hidden */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">
                <MiniStat label="Record" value={record(r.team)} />
                <MiniStat
                  label="All-play"
                  value={`${r.allPlayWins}-${r.allPlayLosses}`}
                />
                <MiniStat label="Avg pts" value={fmtPts(r.avgPoints)} />
                <MiniStat label="Last 3" value={fmtPts(r.recentAvg)} />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ${
                      isLast
                        ? "from-shame-deep to-shame"
                        : "from-accent-strong to-accent"
                    }`}
                    style={{ width: `${(r.score / maxScore) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-zinc-500">
                  {r.score.toFixed(1)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
