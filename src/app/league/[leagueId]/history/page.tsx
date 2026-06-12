import { getNflState } from "@/lib/sleeper/api";
import {
  getLeagueChain,
  getPlayoffBracket,
  getSeasonResult,
  seasonPhase,
  type Team,
} from "@/lib/data";
import { Avatar, Card, PageHeader } from "@/components/ui";
import { StandingsTable } from "@/components/standings";
import { PlayoffBracketView } from "@/components/playoff-bracket";

export const revalidate = 3600;

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

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const [chain, nfl] = await Promise.all([
    getLeagueChain(leagueId),
    getNflState(),
  ]);
  const seasons = await Promise.all(chain.map((l) => getSeasonResult(l)));
  const brackets = await Promise.all(
    chain.map((l) =>
      l.status === "complete" ? getPlayoffBracket(l).catch(() => null) : null,
    ),
  );
  const bracketByLeague = new Map(
    chain.map((l, i) => [l.league_id, brackets[i]] as const),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="League History"
        subtitle="Every season on the books. Banners hang forever; so does shame."
      />
      {seasons.map((s) => {
        const phase = seasonPhase(s.league, nfl.week);

        if (phase === "pre") {
          return (
            <Card key={s.league.league_id} className="relative overflow-hidden">
              <p className="text-sm text-zinc-300">
                <span className="font-bold">{s.league.season}</span> — loading
                the cannon 🧨{" "}
                <span className="text-zinc-500">
                  Season hasn&apos;t kicked off yet.
                </span>
              </p>
            </Card>
          );
        }

        const complete = s.league.status === "complete";
        return (
          <Card
            key={s.league.league_id}
            className="relative overflow-hidden"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-3 right-3 select-none text-7xl font-black text-zinc-800/50"
            >
              {s.league.season}
            </span>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold">{s.league.season} season</h2>
              <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-zinc-400">
                {complete ? "Final" : "In progress"}
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
              {s.regularSeasonWinner &&
                s.regularSeasonWinner.wins +
                  s.regularSeasonWinner.losses +
                  s.regularSeasonWinner.ties >
                  0 && (
                  <SeasonChip
                    label="📈 Best regular season"
                    team={s.regularSeasonWinner}
                    tone="default"
                  />
                )}
              {complete && s.lastPlace && (
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

            {(() => {
              const bracket = bracketByLeague.get(s.league.league_id);
              if (!bracket) return null;
              return (
                <details className="group mt-4 rounded-lg border border-edge bg-surface-2/40">
                  <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-zinc-300 [&::-webkit-details-marker]:hidden">
                    <span>🏟️ Playoff bracket</span>
                    <span className="text-xs text-zinc-500 transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <div className="border-t border-edge px-3 py-3">
                    <PlayoffBracketView bracket={bracket} />
                  </div>
                </details>
              );
            })()}
          </Card>
        );
      })}
    </div>
  );
}
