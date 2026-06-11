import Link from "next/link";
import { LEAGUE_IDS } from "@/lib/config";
import { getLeague, getNflState } from "@/lib/sleeper/api";
import { getTeams, sortStandings } from "@/lib/data";
import { Avatar, Card, record } from "@/components/ui";

export const revalidate = 300;

function SetupNotice() {
  return (
    <Card title="Setup needed" className="mx-auto max-w-xl">
      <p className="text-zinc-300">
        No leagues configured yet. Add your two Sleeper league ids to{" "}
        <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm">
          .env.local
        </code>
        :
      </p>
      <pre className="mt-3 rounded-lg bg-zinc-800/70 p-3 text-sm">
        SLEEPER_LEAGUE_IDS=123456789012345678,876543210987654321
      </pre>
      <p className="mt-3 text-sm text-zinc-400">
        The league id is the long number in your Sleeper league URL. Use the
        current season&apos;s id — past seasons are discovered automatically.
      </p>
    </Card>
  );
}

async function LeagueCard({ leagueId }: { leagueId: string }) {
  try {
    const [league, teams] = await Promise.all([
      getLeague(leagueId),
      getTeams(leagueId),
    ]);
    const standings = sortStandings([...teams.values()]);
    const top = standings.slice(0, 3);
    return (
      <Link href={`/league/${league.league_id}`} className="group">
        <Card className="h-full transition-colors group-hover:border-emerald-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{league.name}</h2>
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300">
              {league.season} · {league.total_rosters} teams
            </span>
          </div>
          <ol className="mt-4 space-y-2">
            {top.map((t, i) => (
              <li key={t.rosterId} className="flex items-center gap-3">
                <span className="w-5 text-right font-mono text-sm text-zinc-500">
                  {i + 1}
                </span>
                <Avatar avatar={t.avatar} size={24} alt={t.name} />
                <span className="flex-1 truncate">{t.name}</span>
                <span className="font-mono text-sm text-zinc-400">
                  {record(t)}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm font-medium text-emerald-400">
            View league →
          </p>
        </Card>
      </Link>
    );
  } catch {
    return (
      <Card title="League unavailable">
        <p className="text-sm text-zinc-400">
          Couldn&apos;t load league <code>{leagueId}</code> from Sleeper. Check
          the id in .env.local.
        </p>
      </Card>
    );
  }
}

export default async function Home() {
  if (!LEAGUE_IDS.length) return <SetupNotice />;
  const nfl = await getNflState().catch(() => null);
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold">The Leagues</h1>
        {nfl && (
          <p className="text-sm text-zinc-400">
            {nfl.season} season · week {nfl.display_week}
          </p>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {LEAGUE_IDS.map((id) => (
          <LeagueCard key={id} leagueId={id} />
        ))}
      </div>
    </div>
  );
}
