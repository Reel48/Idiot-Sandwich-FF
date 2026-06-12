import { getEspnSeasons } from "@/lib/espn/data";
import type { Team } from "@/lib/data";
import { Avatar, Card, PageHeader } from "@/components/ui";
import { StandingsTable } from "@/components/standings";

function SeasonChip({
  label,
  team,
  tone,
}: {
  label: string;
  team: Team;
  tone: "gold" | "shame" | "default";
}) {
  const styles = {
    gold: "border-gold/40 bg-gradient-to-br from-amber-500/15 to-surface-1",
    shame: "border-shame/30 bg-gradient-to-br from-red-500/10 to-surface-1",
    default: "border-edge bg-surface-2",
  } as const;
  const labelColor = {
    gold: "text-gold",
    shame: "text-shame",
    default: "text-zinc-400",
  } as const;
  return (
    <div className={`rounded-lg border p-3 ${styles[tone]}`}>
      <div
        className={`text-xs font-medium uppercase tracking-wider ${labelColor[tone]}`}
      >
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Avatar avatar={team.avatar} size={32} alt={team.name} />
        <span className="min-w-0">
          <span className="block truncate font-medium">{team.name}</span>
          <span className="block truncate text-xs text-zinc-500">
            {team.ownerName}
          </span>
        </span>
      </div>
    </div>
  );
}

export default function EspnHistoryPage() {
  const seasons = getEspnSeasons();

  return (
    <div className="space-y-6">
      <PageHeader
        title="League History"
        subtitle="Nine seasons of receipts, rescued from ESPN before the lights went out."
      />
      {seasons.map((s) => (
        <Card key={s.season} className="relative overflow-hidden">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-3 right-3 select-none text-7xl font-black text-zinc-800/50"
          >
            {s.season}
          </span>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold">{s.season} season</h2>
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-zinc-400">
              Final
            </span>
          </div>

          <div className="relative mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {s.champion && (
              <SeasonChip label="🏆 Champion" team={s.champion} tone="gold" />
            )}
            {s.runnerUp && (
              <SeasonChip
                label="🥈 Runner-up"
                team={s.runnerUp}
                tone="default"
              />
            )}
            {s.regularSeasonWinner && (
              <SeasonChip
                label="📈 Best regular season"
                team={s.regularSeasonWinner}
                tone="default"
              />
            )}
            {s.lastPlace && (
              <SeasonChip
                label="🥪 Idiot Sandwich"
                team={s.lastPlace}
                tone="shame"
              />
            )}
          </div>

          <StandingsTable
            teams={s.standings}
            champRosterId={s.champion?.rosterId}
          />
          <p className="mt-2 text-xs text-zinc-500">
            Final standings as ESPN ranked them — playoffs included.
          </p>
        </Card>
      ))}
    </div>
  );
}
