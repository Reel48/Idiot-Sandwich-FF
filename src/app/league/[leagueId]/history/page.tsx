import { getLeagueChain, getSeasonResult } from "@/lib/data";
import { Card, TeamLabel, fmtPts, record } from "@/components/ui";

export const revalidate = 3600;

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const chain = await getLeagueChain(leagueId);
  const seasons = await Promise.all(chain.map((l) => getSeasonResult(l)));

  return (
    <div className="space-y-6">
      {seasons.map((s) => (
        <Card key={s.league.league_id}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">
              {s.league.season} — {s.league.name}
            </h2>
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
              {s.league.status === "complete" ? "Final" : "In progress"}
            </span>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {s.champion && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <div className="text-xs font-medium uppercase tracking-wider text-amber-400">
                  🏆 Champion
                </div>
                <div className="mt-2">
                  <TeamLabel team={s.champion} />
                </div>
              </div>
            )}
            {s.runnerUp && (
              <div className="rounded-lg bg-zinc-800/60 p-3">
                <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  🥈 Runner-up
                </div>
                <div className="mt-2">
                  <TeamLabel team={s.runnerUp} />
                </div>
              </div>
            )}
            {s.regularSeasonWinner &&
              s.regularSeasonWinner.wins +
                s.regularSeasonWinner.losses +
                s.regularSeasonWinner.ties >
                0 && (
              <div className="rounded-lg bg-zinc-800/60 p-3">
                <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  📈 Best regular season
                </div>
                <div className="mt-2">
                  <TeamLabel team={s.regularSeasonWinner} />
                </div>
              </div>
            )}
          </div>

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
              {s.standings.map((t, i) => (
                <tr key={t.rosterId} className="border-t border-zinc-800/70">
                  <td className="py-2 pr-2 font-mono text-zinc-500">{i + 1}</td>
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span>{t.name}</span>
                      {s.champion?.rosterId === t.rosterId && <span>🏆</span>}
                    </span>
                    <span className="text-xs text-zinc-500">{t.ownerName}</span>
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
      ))}
    </div>
  );
}
