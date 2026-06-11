import Link from "next/link";
import { getLeague } from "@/lib/sleeper/api";

const TABS = [
  { slug: "", label: "Dashboard" },
  { slug: "matchups", label: "Matchups" },
  { slug: "power", label: "Power Rankings" },
  { slug: "history", label: "History" },
  { slug: "records", label: "Records" },
  { slug: "awards", label: "Awards" },
];

export default async function LeagueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const league = await getLeague(leagueId).catch(() => null);
  const base = `/league/${leagueId}`;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{league?.name ?? "League"}</h1>
        {league && (
          <p className="text-sm text-zinc-400">
            {league.season} season ·{" "}
            {league.status === "complete"
              ? "final"
              : league.status.replace("_", " ")}
          </p>
        )}
      </div>
      <nav className="flex flex-wrap gap-1 border-b border-zinc-800 pb-2">
        {TABS.map((t) => (
          <Link
            key={t.slug}
            href={t.slug ? `${base}/${t.slug}` : base}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
