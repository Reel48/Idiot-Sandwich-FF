import type { PlayoffBracket, PlayoffMatch, PlayoffSide } from "@/lib/data";
import { Avatar, fmtPts } from "./ui";

function weekSpan(weeks: number[]) {
  if (weeks.length <= 1) return `Week ${weeks[0] ?? "?"}`;
  return `Weeks ${weeks[0]}–${weeks[weeks.length - 1]}`;
}

function SideRow({
  side,
  isWinner,
  isTwoWeek,
}: {
  side: PlayoffSide | null;
  isWinner: boolean;
  isTwoWeek: boolean;
}) {
  if (!side) {
    return (
      <div className="flex items-center justify-between gap-3 py-1.5 text-zinc-500">
        <span className="text-sm italic">TBD</span>
        <span className="font-mono text-sm">—</span>
      </div>
    );
  }
  const team = side.team;
  return (
    <div
      className={`flex items-center justify-between gap-3 py-1.5 ${
        isWinner ? "" : "opacity-70"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Avatar avatar={team?.avatar ?? null} size={28} alt={team?.name ?? ""} />
        <span className="min-w-0">
          <span
            className={`block truncate text-sm ${
              isWinner ? "font-semibold" : ""
            }`}
          >
            {team?.name ?? `Roster ${side.rosterId}`}
          </span>
          {isTwoWeek && (
            <span className="block truncate font-mono text-xs text-zinc-500">
              {side.weekPoints.map((p) => fmtPts(p)).join(" + ")}
            </span>
          )}
        </span>
      </span>
      <span
        className={`shrink-0 font-mono tabular-nums ${
          isWinner ? "text-base font-bold text-accent" : "text-sm text-zinc-400"
        }`}
      >
        {fmtPts(side.total)}
      </span>
    </div>
  );
}

function MatchCard({ match }: { match: PlayoffMatch }) {
  const isTwoWeek = match.weeks.length > 1;
  const isChamp = match.place === 1;
  const topWins = match.winnerRosterId === match.top?.rosterId;
  const bottomWins = match.winnerRosterId === match.bottom?.rosterId;

  return (
    <div
      className={`rounded-lg border p-3 ${
        isChamp
          ? "border-gold/40 bg-gradient-to-br from-amber-500/10 to-surface-2"
          : "border-edge bg-surface-2"
      }`}
    >
      <div className="mb-1 flex items-center justify-between text-xs">
        <span
          className={`font-semibold uppercase tracking-wider ${
            isChamp ? "text-gold" : "text-zinc-500"
          }`}
        >
          {isChamp && "🏆 "}
          {match.label}
        </span>
        <span className="font-mono text-zinc-500">{weekSpan(match.weeks)}</span>
      </div>
      <SideRow
        side={match.top}
        isWinner={topWins}
        isTwoWeek={isTwoWeek}
      />
      <div className="border-t border-edge/60" />
      <SideRow
        side={match.bottom}
        isWinner={bottomWins}
        isTwoWeek={isTwoWeek}
      />
    </div>
  );
}

export function PlayoffBracketView({ bracket }: { bracket: PlayoffBracket }) {
  const note = bracket.twoWeekAll
    ? "Every playoff round was a two-week, total-points affair."
    : bracket.twoWeekFinal
      ? "The championship was a two-week, total-points showdown."
      : null;

  return (
    <div className="space-y-3">
      {note && (
        <p className="text-xs text-zinc-500">
          <span className="font-medium text-zinc-400">Format:</span> {note}
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        {bracket.rounds.map((round) => (
          <div key={round.round} className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-zinc-300">
                {round.label === "Championship"
                  ? round.label
                  : round.matches.filter((m) => !m.place).length > 1
                    ? `${round.label}s`
                    : round.label}
              </h3>
              <span className="font-mono text-xs text-zinc-500">
                {weekSpan(round.weeks)}
              </span>
            </div>
            <div className="space-y-2">
              {round.matches.map((m) => (
                <MatchCard key={`${m.round}-${m.matchId}`} match={m} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
