import { getLeague, getNflState } from "@/lib/sleeper/api";
import { displayLeagueName } from "@/lib/config";
import { seasonPhase } from "@/lib/data";
import { Avatar } from "@/components/ui";
import { LeagueTabs } from "@/components/nav";

const TABS = [
  { slug: "", label: "Dashboard" },
  { slug: "matchups", label: "Matchups" },
  { slug: "power", label: "Power Rankings" },
  { slug: "history", label: "History" },
  { slug: "records", label: "Records" },
  { slug: "awards", label: "Awards" },
];

function StatusChip({ phase }: { phase: "pre" | "live" | "done" }) {
  const styles = {
    pre: "bg-amber-500/15 text-gold border-gold/30",
    live: "bg-emerald-500/15 text-accent border-accent/30",
    done: "bg-surface-2 text-zinc-400 border-edge",
  } as const;
  const labels = { pre: "Offseason", live: "Live", done: "Final" } as const;
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[phase]}`}
    >
      {labels[phase]}
    </span>
  );
}

export default async function LeagueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const [league, nfl] = await Promise.all([
    getLeague(leagueId).catch(() => null),
    getNflState().catch(() => null),
  ]);
  const base = `/league/${leagueId}`;
  const phase = league ? seasonPhase(league, nfl?.week ?? 0) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        {league && (
          <Avatar avatar={league.avatar} size={48} alt={league.name} />
        )}
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-black tracking-tight">
            <span className="truncate">
              {league ? displayLeagueName(league.name) : "League"}
            </span>
            {phase && <StatusChip phase={phase} />}
          </h1>
          {league && (
            <p className="text-sm text-zinc-400">{league.season} season</p>
          )}
        </div>
      </div>
      <div className="border-b border-edge">
        <LeagueTabs base={base} tabs={TABS} />
      </div>
      {children}
    </div>
  );
}
