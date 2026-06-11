import type { TeamBox } from "@/lib/box-score";
import type { Team } from "@/lib/data";
import { fmtPts } from "./ui";

const POS_COLORS: Record<string, string> = {
  QB: "text-red-400",
  RB: "text-emerald-400",
  WR: "text-sky-400",
  TE: "text-amber-400",
  K: "text-violet-400",
  DEF: "text-zinc-400",
  FLEX: "text-pink-400",
  SUPER_FLEX: "text-pink-400",
  REC_FLEX: "text-pink-400",
  WRRB_FLEX: "text-pink-400",
};

function slotLabel(slot: string) {
  if (slot === "SUPER_FLEX") return "SFLX";
  if (slot === "REC_FLEX" || slot === "WRRB_FLEX") return "FLEX";
  return slot;
}

function TeamColumn({
  team,
  box,
  hotPlayerId,
}: {
  team: Team;
  box: TeamBox;
  hotPlayerId: string | null;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 truncate text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {team.name}
      </p>
      <ul className="space-y-1">
        {box.lines.map((l, i) => (
          <li
            key={`${l.playerId}-${i}`}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className={`w-10 shrink-0 text-[10px] font-bold ${
                POS_COLORS[l.slot] ?? "text-zinc-500"
              }`}
            >
              {slotLabel(l.slot)}
            </span>
            <span
              className={`min-w-0 flex-1 truncate ${
                l.empty ? "italic text-shame" : ""
              }`}
            >
              {l.name}
              {l.nflTeam && (
                <span className="ml-1 text-xs text-zinc-500">{l.nflTeam}</span>
              )}
              {l.playerId === hotPlayerId && <span className="ml-1">🔥</span>}
            </span>
            <span className="shrink-0 font-mono text-sm tabular-nums">
              {fmtPts(l.points)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex items-center justify-between border-t border-edge pt-2 text-xs text-zinc-500">
        <span>Bench</span>
        <span className="font-mono">{fmtPts(box.benchTotal)}</span>
      </p>
    </div>
  );
}

export function BoxScore({
  home,
  away,
  homeBox,
  awayBox,
}: {
  home: Team;
  away: Team;
  homeBox: TeamBox;
  awayBox: TeamBox;
}) {
  // Top single performer of the whole game gets the flame.
  let hotPlayerId: string | null = null;
  let hotPoints = -Infinity;
  for (const box of [homeBox, awayBox]) {
    for (const l of box.lines) {
      if (!l.empty && l.points > hotPoints) {
        hotPoints = l.points;
        hotPlayerId = l.playerId;
      }
    }
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TeamColumn team={home} box={homeBox} hotPlayerId={hotPlayerId} />
      <TeamColumn team={away} box={awayBox} hotPlayerId={hotPlayerId} />
    </div>
  );
}
