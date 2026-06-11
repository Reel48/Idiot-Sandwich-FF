import { getAllTimeData } from "@/lib/data";
import { Avatar, Card, PageHeader, RankBadge, fmtPts } from "@/components/ui";

export const revalidate = 3600;

const trophies = (n: number) => "🏆".repeat(n);

function h2hCellStyle(wins: number, losses: number, ties: number) {
  const total = wins + losses + ties;
  if (!total) return undefined;
  const pct = (wins + ties / 2) / total;
  const alpha = Math.min(0.35, Math.abs(pct - 0.5) * 0.7);
  if (alpha < 0.02) return undefined;
  return {
    backgroundColor:
      pct > 0.5
        ? `rgb(16 185 129 / ${alpha.toFixed(3)})`
        : `rgb(248 113 113 / ${alpha.toFixed(3)})`,
  };
}

export default async function RecordsPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const { franchises, h2h } = await getAllTimeData(leagueId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="The Receipts"
        subtitle="All-time franchise records across every linked season. No deleting your history."
      />

      <Card title="All-time franchise records">
        {/* Desktop table */}
        <div className="relative hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="sticky left-0 z-10 bg-surface-1 pb-2 pr-2">
                  Franchise
                </th>
                <th className="pb-2 text-right">Seasons</th>
                <th className="pb-2 text-right">W-L-T</th>
                <th className="pb-2 text-right">Win %</th>
                <th className="pb-2 text-right">PF</th>
                <th className="pb-2 text-right">PA</th>
                <th className="pb-2 text-right">Titles</th>
                <th className="pb-2 text-right">Best game</th>
                <th className="pb-2 text-right">Worst game</th>
              </tr>
            </thead>
            <tbody>
              {franchises.map((f, i) => {
                const total = f.wins + f.losses + f.ties;
                return (
                  <tr key={f.ownerId} className="border-t border-edge">
                    <td className="sticky left-0 z-10 bg-surface-1 py-2 pr-2">
                      <span className="flex items-center gap-2">
                        <RankBadge rank={i + 1} total={franchises.length} />
                        <Avatar avatar={f.avatar} size={24} alt={f.name} />
                        <span className="min-w-0">
                          <span className="block max-w-[180px] truncate font-medium">
                            {f.name}
                          </span>
                          <span className="block text-xs text-zinc-500">
                            {f.ownerName}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono">{f.seasons}</td>
                    <td className="py-2 text-right font-mono">
                      {f.wins}-{f.losses}
                      {f.ties ? `-${f.ties}` : ""}
                    </td>
                    <td className="py-2 text-right font-mono">
                      {total
                        ? ((100 * (f.wins + f.ties / 2)) / total).toFixed(1)
                        : "0.0"}
                      %
                    </td>
                    <td className="py-2 text-right font-mono">
                      {fmtPts(f.pointsFor)}
                    </td>
                    <td className="py-2 text-right font-mono text-zinc-500">
                      {fmtPts(f.pointsAgainst)}
                    </td>
                    <td className="py-2 text-right">
                      {f.championships ? trophies(f.championships) : ""}
                    </td>
                    <td className="py-2 text-right font-mono text-accent">
                      {f.highGame ? fmtPts(f.highGame.points) : "—"}
                      {f.highGame && (
                        <span className="block text-xs text-zinc-500">
                          {f.highGame.season} wk {f.highGame.week}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right font-mono text-shame">
                      {f.lowGame ? fmtPts(f.lowGame.points) : "—"}
                      {f.lowGame && (
                        <span className="block text-xs text-zinc-500">
                          {f.lowGame.season} wk {f.lowGame.week}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <ul className="divide-y divide-edge sm:hidden">
          {franchises.map((f, i) => {
            const total = f.wins + f.losses + f.ties;
            return (
              <li key={f.ownerId} className="py-3">
                <div className="flex items-center gap-3">
                  <RankBadge rank={i + 1} total={franchises.length} />
                  <Avatar avatar={f.avatar} size={36} alt={f.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">
                      {f.name} {f.championships ? trophies(f.championships) : ""}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {f.ownerName} · {f.seasons} season{f.seasons === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono font-semibold">
                      {f.wins}-{f.losses}
                      {f.ties ? `-${f.ties}` : ""}
                    </span>
                    <span className="block font-mono text-xs text-zinc-500">
                      {total
                        ? ((100 * (f.wins + f.ties / 2)) / total).toFixed(1)
                        : "0.0"}
                      %
                    </span>
                  </span>
                </div>
                <div className="mt-2 flex gap-4 pl-10 text-xs text-zinc-500">
                  <span>
                    Best:{" "}
                    <span className="font-mono text-accent">
                      {f.highGame ? fmtPts(f.highGame.points) : "—"}
                    </span>
                  </span>
                  <span>
                    Worst:{" "}
                    <span className="font-mono text-shame">
                      {f.lowGame ? fmtPts(f.lowGame.points) : "—"}
                    </span>
                  </span>
                  <span>
                    PF: <span className="font-mono">{fmtPts(f.pointsFor)}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Head-to-head (all-time, regular season)">
        <div className="relative">
          <div className="overflow-x-auto pb-1">
            <table className="w-full min-w-[560px] text-xs">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-surface-1 p-1.5 text-left text-zinc-500">
                    vs →
                  </th>
                  {franchises.map((f) => (
                    <th key={f.ownerId} className="p-1.5" title={f.name}>
                      <span className="flex justify-center">
                        <Avatar avatar={f.avatar} size={24} alt={f.name} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {franchises.map((row) => (
                  <tr key={row.ownerId} className="border-t border-edge">
                    <td
                      className="sticky left-0 z-10 max-w-[120px] truncate bg-surface-1 p-1.5 font-medium"
                      title={row.name}
                    >
                      {row.ownerName}
                    </td>
                    {franchises.map((col) => {
                      if (row.ownerId === col.ownerId)
                        return (
                          <td
                            key={col.ownerId}
                            className="p-1.5 text-center text-zinc-700"
                          >
                            ·
                          </td>
                        );
                      const c = h2h.get(row.ownerId)?.get(col.ownerId);
                      if (!c)
                        return (
                          <td
                            key={col.ownerId}
                            className="p-1.5 text-center text-zinc-600"
                          >
                            —
                          </td>
                        );
                      return (
                        <td
                          key={col.ownerId}
                          className="p-1.5 text-center font-mono tabular-nums"
                          style={h2hCellStyle(c.wins, c.losses, c.ties)}
                          title={`${row.ownerName} vs ${col.ownerName}`}
                        >
                          {c.wins}-{c.losses}
                          {c.ties ? `-${c.ties}` : ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface-1 sm:hidden" />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Read across: the row owner&apos;s record against each column owner.
          Greener = owns them, redder = owned by them.
        </p>
      </Card>
    </div>
  );
}
