import Link from "next/link";
import { LEAGUE_IDS, displayLeagueName } from "@/lib/config";
import { getLeague, getNflState } from "@/lib/sleeper/api";
import {
  getReigningChampion,
  getTeams,
  seasonPhase,
  sortStandings,
} from "@/lib/data";
import { Avatar, Card, RankBadge, record } from "@/components/ui";

export const revalidate = 300;

function SetupNotice() {
  return (
    <Card title="Setup needed" className="mx-auto max-w-xl">
      <p className="text-zinc-300">
        No leagues configured. Add Sleeper league ids to{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 text-sm">
          .env.local
        </code>{" "}
        as <code>SLEEPER_LEAGUE_IDS</code>.
      </p>
    </Card>
  );
}

async function LeagueCard({
  leagueId,
  nflWeek,
}: {
  leagueId: string;
  nflWeek: number;
}) {
  try {
    const [league, teams] = await Promise.all([
      getLeague(leagueId),
      getTeams(leagueId),
    ]);
    const phase = seasonPhase(league, nflWeek);

    let body: React.ReactNode;
    if (phase === "pre") {
      const last = await getReigningChampion(leagueId);
      body = last ? (
        <ul className="mt-4 space-y-3">
          {last.champion && (
            <li className="flex items-center gap-3">
              <span className="text-lg">🏆</span>
              <Avatar
                avatar={last.champion.avatar}
                size={28}
                alt={last.champion.name}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {last.champion.name}
                </span>
                <span className="block text-xs text-gold">
                  Reigning champ · {last.league.season}
                </span>
              </span>
            </li>
          )}
          {last.lastPlace && (
            <li className="flex items-center gap-3">
              <span className="text-lg">🥪</span>
              <Avatar
                avatar={last.lastPlace.avatar}
                size={28}
                alt={last.lastPlace.name}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {last.lastPlace.name}
                </span>
                <span className="block text-xs text-shame">
                  The Idiot Sandwich · {last.league.season}
                </span>
              </span>
            </li>
          )}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-zinc-400">
          First season — history starts here. 🍞
        </p>
      );
    } else {
      const top = sortStandings([...teams.values()]).slice(0, 3);
      body = (
        <ol className="mt-4 space-y-2">
          {top.map((t, i) => (
            <li key={t.rosterId} className="flex items-center gap-3">
              <RankBadge rank={i + 1} total={teams.size} />
              <Avatar avatar={t.avatar} size={24} alt={t.name} />
              <span className="min-w-0 flex-1 truncate">{t.name}</span>
              <span className="font-mono text-sm text-zinc-400">
                {record(t)}
              </span>
            </li>
          ))}
        </ol>
      );
    }

    const chip =
      phase === "pre"
        ? "border-gold/30 bg-amber-500/15 text-gold"
        : phase === "live"
          ? "border-accent/30 bg-emerald-500/15 text-accent"
          : "border-edge bg-surface-2 text-zinc-400";

    return (
      <Link href={`/league/${league.league_id}`} className="group">
        <Card className="h-full group-hover:border-accent/60 group-hover:bg-surface-2/40">
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <Avatar avatar={league.avatar} size={36} alt={league.name} />
              <span className="truncate text-lg font-bold">
                {displayLeagueName(league.name)}
              </span>
            </span>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${chip}`}
            >
              {league.season} ·{" "}
              {phase === "pre"
                ? "offseason"
                : phase === "live"
                  ? "live"
                  : "final"}
            </span>
          </div>
          {body}
          <p className="mt-4 text-sm font-medium text-accent">View league →</p>
        </Card>
      </Link>
    );
  } catch {
    return (
      <Card title="League unavailable">
        <p className="text-sm text-zinc-400">
          Couldn&apos;t load league <code>{leagueId}</code> from Sleeper.
        </p>
      </Card>
    );
  }
}

export default async function Home() {
  if (!LEAGUE_IDS.length) return <SetupNotice />;
  const nfl = await getNflState().catch(() => null);
  return (
    <div className="space-y-8">
      <div className="pt-2">
        <h1 className="text-4xl font-black tracking-tight">
          The Leagues<span className="text-accent">.</span>
        </h1>
        <p className="mt-1 text-zinc-400">
          Two leagues. One sandwich. Zero dignity.
        </p>
        {nfl && nfl.season_type === "regular" && (
          <p className="mt-2 inline-block rounded-full border border-accent/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-accent">
            {nfl.season} season · week {nfl.display_week}
          </p>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {LEAGUE_IDS.map((id) => (
          <LeagueCard key={id} leagueId={id} nflWeek={nfl?.week ?? 0} />
        ))}
      </div>
      <Link href="/espn" className="group block">
        <Card className="group-hover:border-accent/60 group-hover:bg-surface-2/40">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl">📼</span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">The ESPN Era</span>
              <span className="block text-sm text-zinc-400">
                2017–2025 archive — every champion, sandwich, and grudge from
                before the move to Sleeper.
              </span>
            </span>
            <span className="text-sm font-medium text-accent">
              View archive →
            </span>
          </div>
        </Card>
      </Link>
    </div>
  );
}
