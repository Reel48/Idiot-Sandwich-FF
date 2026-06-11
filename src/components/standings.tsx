import type { Team } from "@/lib/data";
import { RankBadge, TeamLabel, fmtPts, record } from "./ui";

/**
 * One real table at every screen size. On narrow screens it scrolls
 * horizontally with the rank+team column pinned, so every column stays
 * reachable — nothing is hidden on mobile.
 */
export function StandingsTable({
  teams,
  champRosterId,
  playoffTeams,
}: {
  teams: Team[];
  champRosterId?: number;
  playoffTeams?: number;
}) {
  const total = teams.length;
  const cutAfter =
    playoffTeams && playoffTeams > 0 && playoffTeams < total
      ? playoffTeams
      : null;

  return (
    <div className="relative">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full min-w-[480px] text-sm table-sticky-col">
          <thead className="text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="pb-2 pr-3">Team</th>
              <th className="pb-2 text-right">Record</th>
              <th className="pb-2 pl-4 text-right">PF</th>
              <th className="pb-2 pl-4 text-right">PA</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t, i) => (
              <tr
                key={t.rosterId}
                className={`border-t border-edge ${
                  cutAfter && i === cutAfter
                    ? "border-t-2 border-t-accent/40"
                    : ""
                }`}
              >
                <td className="max-w-[220px] py-2 pr-3">
                  <span className="flex items-center gap-2.5">
                    <RankBadge rank={i + 1} total={total} />
                    <TeamLabel team={t} />
                    {champRosterId === t.rosterId && <span>🏆</span>}
                  </span>
                </td>
                <td className="py-2 text-right font-mono">{record(t)}</td>
                <td className="py-2 pl-4 text-right font-mono">
                  {fmtPts(t.pointsFor)}
                </td>
                <td className="py-2 pl-4 text-right font-mono text-zinc-500">
                  {fmtPts(t.pointsAgainst)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface-1 sm:hidden" />
      {cutAfter && (
        <p className="mt-2 text-xs text-zinc-500">
          <span className="text-accent">—</span> playoff line: top {cutAfter}{" "}
          make it in
        </p>
      )}
    </div>
  );
}
