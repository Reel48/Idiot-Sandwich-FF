import { getLeague, getNflState } from "@/lib/sleeper/api";
import {
  computeWeekAwards,
  getSeasonGames,
  getTeams,
  lastCompletedWeek,
  type Team,
  type WeekAwards,
} from "@/lib/data";
import { Avatar, Card, EmptyState, PageHeader, fmtPts } from "@/components/ui";

export const revalidate = 300;

function AwardRow({
  emoji,
  label,
  team,
  children,
  tone,
}: {
  emoji: string;
  label: string;
  team?: Team;
  children: React.ReactNode;
  tone?: "gold" | "shame";
}) {
  const border =
    tone === "gold"
      ? "border-l-2 border-gold/50 pl-2"
      : tone === "shame"
        ? "border-l-2 border-shame/50 pl-2"
        : "";
  return (
    <li className={`flex items-center gap-2 text-sm ${border}`}>
      <span>{emoji}</span>
      {team && <Avatar avatar={team.avatar} size={22} alt={team.name} />}
      <span className="min-w-0">
        <span className="font-medium text-zinc-300">{label}:</span> {children}
      </span>
    </li>
  );
}

function WeekCard({ awards }: { awards: WeekAwards }) {
  return (
    <Card title={`Week ${awards.week}`}>
      <ul className="space-y-2.5">
        {awards.highScore && (
          <AwardRow
            emoji="🔥"
            label="Top score"
            team={awards.highScore.team}
            tone="gold"
          >
            {awards.highScore.team.name} — {fmtPts(awards.highScore.points)}
          </AwardRow>
        )}
        {awards.lowScore && (
          <AwardRow
            emoji="🥶"
            label="Stinker of the week"
            team={awards.lowScore.team}
            tone="shame"
          >
            {awards.lowScore.team.name} — {fmtPts(awards.lowScore.points)}
          </AwardRow>
        )}
        {awards.biggestBlowout && (
          <AwardRow
            emoji="💥"
            label="Biggest blowout"
            team={awards.biggestBlowout.winner}
          >
            {awards.biggestBlowout.winner.name} flattened{" "}
            {awards.biggestBlowout.loser.name} by{" "}
            {fmtPts(awards.biggestBlowout.margin)}
          </AwardRow>
        )}
        {awards.closestGame && (
          <AwardRow
            emoji="😅"
            label="Nail-biter"
            team={awards.closestGame.winner}
          >
            {awards.closestGame.winner.name} edged{" "}
            {awards.closestGame.loser.name} by{" "}
            {fmtPts(awards.closestGame.margin)}
          </AwardRow>
        )}
        {awards.bestLoss && (
          <AwardRow emoji="💔" label="Toughest beat" team={awards.bestLoss.team}>
            {awards.bestLoss.team.name} lost despite{" "}
            {fmtPts(awards.bestLoss.points)}
          </AwardRow>
        )}
        {awards.worstWin && (
          <AwardRow emoji="🍀" label="Luckiest win" team={awards.worstWin.team}>
            {awards.worstWin.team.name} won with only{" "}
            {fmtPts(awards.worstWin.points)}
          </AwardRow>
        )}
      </ul>
    </Card>
  );
}

function Tally({
  title,
  emoji,
  rows,
  tone,
}: {
  title: string;
  emoji: string;
  rows: { team: Team; count: number }[];
  tone: "gold" | "shame";
}) {
  return (
    <div>
      <p
        className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
          tone === "gold" ? "text-gold" : "text-shame"
        }`}
      >
        {emoji} {title}
      </p>
      <ul className="space-y-1.5">
        {rows.map(({ team, count }) => (
          <li key={team.rosterId} className="flex items-center gap-2 text-sm">
            <Avatar avatar={team.avatar} size={22} alt={team.name} />
            <span className="min-w-0 flex-1 truncate">{team.name}</span>
            <span className="font-mono text-zinc-400">×{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function AwardsPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const [league, teams, nfl] = await Promise.all([
    getLeague(leagueId),
    getTeams(leagueId),
    getNflState(),
  ]);
  const completed = lastCompletedWeek(league, nfl.week);
  const games = await getSeasonGames(league, completed);
  const weeks = [...new Set(games.map((g) => g.week))].sort((a, b) => b - a);
  const allAwards = weeks
    .map((w) => computeWeekAwards(w, games, teams))
    .filter((a): a is WeekAwards => a !== null);

  if (!allAwards.length) {
    return (
      <Card>
        <EmptyState
          emoji="🏅"
          title="No awards to hand out yet."
          hint="Weekly superlatives start rolling in after the first games."
        />
      </Card>
    );
  }

  const tally = (pick: (a: WeekAwards) => Team | undefined) => {
    const counts = new Map<number, { team: Team; count: number }>();
    for (const a of allAwards) {
      const t = pick(a);
      if (!t) continue;
      const cur = counts.get(t.rosterId) ?? { team: t, count: 0 };
      cur.count++;
      counts.set(t.rosterId, cur);
    }
    return [...counts.values()].sort((x, y) => y.count - x.count).slice(0, 3);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Weekly Awards"
        subtitle="Superlatives nobody asked for, handed out anyway."
      />

      <Card title={`Season tally — ${league.season}`}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Tally
            title="Most top scores"
            emoji="🔥"
            tone="gold"
            rows={tally((a) => a.highScore?.team)}
          />
          <Tally
            title="Most stinkers"
            emoji="🥶"
            tone="shame"
            rows={tally((a) => a.lowScore?.team)}
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {allAwards.map((a) => (
          <WeekCard key={a.week} awards={a} />
        ))}
      </div>
    </div>
  );
}
