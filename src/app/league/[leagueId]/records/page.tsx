import { getAllTimeData } from "@/lib/data";
import { Avatar, Card, fmtPts } from "@/components/ui";

export const revalidate = 3600;

export default async function RecordsPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const { franchises, h2h } = await getAllTimeData(leagueId);

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();

  return (
    <div className="space-y-6">
      <Card title="All-time franchise records">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="pb-2">Franchise</th>
                <th className="pb-2 text-right">Seasons</th>
                <th className="pb-2 text-right">W-L-T</th>
                <th className="pb-2 text-right">Win %</th>
                <th className="pb-2 text-right">PF</th>
                <th className="pb-2 text-right">PA</th>
                <th className="pb-2 text-right">🏆</th>
                <th className="pb-2 text-right">Best game</th>
                <th className="pb-2 text-right">Worst game</th>
              </tr>
            </thead>
            <tbody>
              {franchises.map((f) => {
                const total = f.wins + f.losses + f.ties;
                return (
                  <tr key={f.ownerId} className="border-t border-zinc-800/70">
                    <td className="py-2">
                      <span className="flex items-center gap-2">
                        <Avatar avatar={f.avatar} size={24} alt={f.name} />
                        <span>
                          <span className="block font-medium">{f.name}</span>
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
                      {total ? ((100 * (f.wins + f.ties / 2)) / total).toFixed(1) : "0.0"}%
                    </td>
                    <td className="py-2 text-right font-mono">
                      {fmtPts(f.pointsFor)}
                    </td>
                    <td className="py-2 text-right font-mono text-zinc-400">
                      {fmtPts(f.pointsAgainst)}
                    </td>
                    <td className="py-2 text-right font-mono">
                      {f.championships || ""}
                    </td>
                    <td className="py-2 text-right font-mono text-emerald-400">
                      {f.highGame ? fmtPts(f.highGame.points) : "—"}
                      {f.highGame && (
                        <span className="block text-xs text-zinc-500">
                          {f.highGame.season} wk {f.highGame.week}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right font-mono text-red-400">
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
      </Card>

      <Card title="Head-to-head (all-time, regular season)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs">
            <thead>
              <tr>
                <th className="p-1 text-left text-zinc-500">vs →</th>
                {franchises.map((f) => (
                  <th key={f.ownerId} className="p-1 text-center text-zinc-400" title={f.name}>
                    {initials(f.ownerName)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {franchises.map((row) => (
                <tr key={row.ownerId} className="border-t border-zinc-800/70">
                  <td className="p-1 font-medium" title={row.name}>
                    {row.ownerName}
                  </td>
                  {franchises.map((col) => {
                    if (row.ownerId === col.ownerId)
                      return (
                        <td key={col.ownerId} className="p-1 text-center text-zinc-700">
                          ·
                        </td>
                      );
                    const c = h2h.get(row.ownerId)?.get(col.ownerId);
                    if (!c)
                      return (
                        <td key={col.ownerId} className="p-1 text-center text-zinc-600">
                          —
                        </td>
                      );
                    const winning = c.wins > c.losses;
                    const losing = c.losses > c.wins;
                    return (
                      <td
                        key={col.ownerId}
                        className={`p-1 text-center font-mono ${
                          winning
                            ? "text-emerald-400"
                            : losing
                              ? "text-red-400"
                              : "text-zinc-300"
                        }`}
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
        <p className="mt-2 text-xs text-zinc-500">
          Read across: the row owner&apos;s record against each column owner.
        </p>
      </Card>
    </div>
  );
}
