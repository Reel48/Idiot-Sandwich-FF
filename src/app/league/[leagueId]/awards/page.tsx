import { getLeague, getNflState } from "@/lib/sleeper/api";
import {
  computeWeekAwards,
  getSeasonGames,
  getTeams,
  lastCompletedWeek,
  type WeekAwards,
} from "@/lib/data";
import { Card, fmtPts } from "@/components/ui";

export const revalidate = 300;

function AwardRow({
  emoji,
  label,
  children,
}: {
  emoji: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-2 text-sm">
      <span>{emoji}</span>
      <span>
        <span className="font-medium text-zinc-300">{label}:</span> {children}
      </span>
    </li>
  );
}

function WeekCard({ awards }: { awards: WeekAwards }) {
  return (
    <Card title={`Week ${awards.week}`}>
      <ul className="space-y-2">
        {awards.highScore && (
          <AwardRow emoji="🔥" label="Top score">
            {awards.highScore.team.name} — {fmtPts(awards.highScore.points)}
          </AwardRow>
        )}
        {awards.lowScore && (
          <AwardRow emoji="🥶" label="Stinker of the week">
            {awards.lowScore.team.name} — {fmtPts(awards.lowScore.points)}
          </AwardRow>
        )}
        {awards.biggestBlowout && (
          <AwardRow emoji="💥" label="Biggest blowout">
            {awards.biggestBlowout.winner.name} flattened{" "}
            {awards.biggestBlowout.loser.name} by{" "}
            {fmtPts(awards.biggestBlowout.margin)}
          </AwardRow>
        )}
        {awards.closestGame && (
          <AwardRow emoji="😅" label="Nail-biter">
            {awards.closestGame.winner.name} edged{" "}
            {awards.closestGame.loser.name} by{" "}
            {fmtPts(awards.closestGame.margin)}
          </AwardRow>
        )}
        {awards.bestLoss && (
          <AwardRow emoji="💔" label="Toughest beat">
            {awards.bestLoss.team.name} lost despite{" "}
            {fmtPts(awards.bestLoss.points)}
          </AwardRow>
        )}
        {awards.worstWin && (
          <AwardRow emoji="🍀" label="Luckiest win">
            {awards.worstWin.team.name} won with only{" "}
            {fmtPts(awards.worstWin.points)}
          </AwardRow>
        )}
      </ul>
    </Card>
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
        <p className="text-sm text-zinc-400">
          Weekly awards appear once the season has at least one completed week.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {allAwards.map((a) => (
        <WeekCard key={a.week} awards={a} />
      ))}
    </div>
  );
}
