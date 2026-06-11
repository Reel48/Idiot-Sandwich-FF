import type { Team } from "@/lib/data";
import { RankBadge, TeamLabel, fmtPts, record } from "./ui";

/**
 * Responsive standings: a full table on sm+ and a stacked list on mobile.
 * Both are server-rendered HTML for ~12 rows, so the duplication is free
 * and nothing gets hidden on small screens.
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
    <>
      {/* Desktop / tablet */}
      <table className="hidden w-full text-sm sm:table">
        <thead className="text-left text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="pb-2 pr-2">#</th>
            <th className="pb-2">Team</th>
            <th className="pb-2 text-right">Record</th>
            <th className="pb-2 text-right">PF</th>
            <th className="pb-2 text-right">PA</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t, i) => (
            <tr
              key={t.rosterId}
              className={`border-t border-edge ${
                cutAfter && i === cutAfter ? "border-t-2 border-t-accent/40" : ""
              }`}
            >
              <td className="py-2 pr-2">
                <RankBadge rank={i + 1} total={total} />
              </td>
              <td className="py-2">
                <span className="flex items-center gap-2">
                  <TeamLabel team={t} />
                  {champRosterId === t.rosterId && <span>🏆</span>}
                </span>
              </td>
              <td className="py-2 text-right font-mono">{record(t)}</td>
              <td className="py-2 text-right font-mono">{fmtPts(t.pointsFor)}</td>
              <td className="py-2 text-right font-mono text-zinc-500">
                {fmtPts(t.pointsAgainst)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile */}
      <ul className="divide-y divide-edge sm:hidden">
        {teams.map((t, i) => (
          <li key={t.rosterId}>
            <div
              className={`flex items-center gap-3 py-2.5 ${
                cutAfter && i === cutAfter
                  ? "border-t-2 border-t-accent/40 -mt-px"
                  : ""
              }`}
            >
              <RankBadge rank={i + 1} total={total} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <TeamLabel team={t} size={32} />
                  {champRosterId === t.rosterId && <span>🏆</span>}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-mono font-semibold">{record(t)}</span>
                <span className="block font-mono text-xs text-zinc-500">
                  {fmtPts(t.pointsFor)} pf
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
      {cutAfter && (
        <p className="mt-2 text-xs text-zinc-500">
          <span className="text-accent">—</span> playoff line: top {cutAfter}{" "}
          make it in
        </p>
      )}
    </>
  );
}
