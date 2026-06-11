import Link from "next/link";
import { getLeague, getMatchups, getNflState } from "@/lib/sleeper/api";
import { getPlayersLite } from "@/lib/sleeper/players";
import type { SleeperMatchup } from "@/lib/sleeper/types";
import { getTeams, type Team } from "@/lib/data";
import { buildTeamBox } from "@/lib/box-score";
import { Card, EmptyState, PageHeader, TeamLabel, fmtPts } from "@/components/ui";
import { BoxScore } from "@/components/box-score";

export const revalidate = 300;

interface RawGame {
  matchupId: number;
  home: SleeperMatchup;
  away: SleeperMatchup;
}

function pairRaw(raw: SleeperMatchup[]): RawGame[] {
  const byId = new Map<number, SleeperMatchup[]>();
  for (const m of raw) {
    if (m.matchup_id == null) continue;
    const list = byId.get(m.matchup_id) ?? [];
    list.push(m);
    byId.set(m.matchup_id, list);
  }
  return [...byId.entries()]
    .filter(([, pair]) => pair.length === 2)
    .map(([matchupId, [home, away]]) => ({ matchupId, home, away }))
    .sort((a, b) => a.matchupId - b.matchupId);
}

function ScoreRows({
  sides,
}: {
  sides: { team: Team; pts: number; win: boolean; played: boolean }[];
}) {
  return (
    <>
      {sides.map(({ team, pts, win, played }) => (
        <div
          key={team.rosterId}
          className={`flex items-center justify-between gap-3 py-1.5 ${
            played && !win ? "opacity-60" : ""
          }`}
        >
          <TeamLabel team={team} />
          <span
            className={`font-mono text-lg tabular-nums ${
              win ? "font-bold text-accent" : ""
            }`}
          >
            {fmtPts(pts)}
          </span>
        </div>
      ))}
    </>
  );
}

export default async function MatchupsPage({
  params,
  searchParams,
}: {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { leagueId } = await params;
  const { week: weekParam } = await searchParams;
  const [league, teams, nfl] = await Promise.all([
    getLeague(leagueId),
    getTeams(leagueId),
    getNflState(),
  ]);

  const maxWeek =
    league.status === "complete"
      ? 18
      : Math.min(18, Math.max(1, league.settings.leg || nfl.display_week || 1));
  const week = Math.min(
    Math.max(1, parseInt(weekParam ?? "", 10) || maxWeek),
    18,
  );

  const games = pairRaw(await getMatchups(leagueId, week).catch(() => []));
  const playoffStart = league.settings.playoff_week_start || 15;
  const anyPlayed = games.some(
    (g) => (g.home.points ?? 0) > 0 || (g.away.points ?? 0) > 0,
  );
  const players = anyPlayed ? await getPlayersLite().catch(() => null) : null;

  return (
    <div className="space-y-4">
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 no-scrollbar snap-x sm:mx-0 sm:flex-wrap sm:px-0">
        {Array.from({ length: maxWeek }, (_, i) => i + 1).map((w) => (
          <Link
            key={w}
            prefetch={false}
            href={`/league/${leagueId}/matchups?week=${w}`}
            className={`shrink-0 snap-start rounded-md px-2.5 py-1 font-mono text-sm transition-colors ${
              w === week
                ? "bg-accent-strong text-white"
                : w >= playoffStart
                  ? "bg-surface-2 text-gold hover:bg-surface-3"
                  : "bg-surface-2 text-zinc-300 hover:bg-surface-3"
            }`}
          >
            {w}
          </Link>
        ))}
      </div>

      <PageHeader
        title={`Week ${week}`}
        subtitle={
          anyPlayed ? "Tap a finished game for the full box score" : undefined
        }
      >
        {week >= playoffStart && (
          <span className="rounded-full border border-gold/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-gold">
            Playoffs
          </span>
        )}
      </PageHeader>

      {games.length === 0 ? (
        <Card>
          <EmptyState
            title="Nothing's cooking this week."
            hint="Matchups appear once Sleeper sets the schedule."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {games.map((g) => {
            const home = teams.get(g.home.roster_id);
            const away = teams.get(g.away.roster_id);
            if (!home || !away) return null;
            const hPts = g.home.points ?? 0;
            const aPts = g.away.points ?? 0;
            const played = hPts > 0 || aPts > 0;
            const margin = Math.abs(hPts - aPts);
            const sides = [
              { team: home, pts: hPts, win: played && hPts > aPts, played },
              { team: away, pts: aPts, win: played && aPts > hPts, played },
            ];

            const homeBox =
              played && players
                ? buildTeamBox(g.home, league.roster_positions, players)
                : null;
            const awayBox =
              played && players
                ? buildTeamBox(g.away, league.roster_positions, players)
                : null;

            if (!played || !homeBox || !awayBox) {
              return (
                <Card key={g.matchupId}>
                  <ScoreRows sides={sides} />
                  <p className="mt-1 border-t border-edge pt-2 text-xs text-zinc-500">
                    {played
                      ? margin === 0
                        ? "Tie game"
                        : `Margin: ${fmtPts(margin)} pts — no play-by-play for this one`
                      : "Kickoff pending"}
                  </p>
                </Card>
              );
            }

            return (
              <details
                key={g.matchupId}
                className="group rounded-card border border-edge bg-surface-1 transition-colors open:border-edge-strong sm:col-span-1 open:sm:col-span-2"
              >
                <summary className="cursor-pointer select-none list-none p-4 [&::-webkit-details-marker]:hidden">
                  <ScoreRows sides={sides} />
                  <p className="mt-1 flex items-center justify-between border-t border-edge pt-2 text-xs text-zinc-500">
                    <span>
                      {margin === 0
                        ? "Tie game"
                        : `Margin: ${fmtPts(margin)} pts`}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-accent">
                      Box score
                      <span className="inline-block transition-transform group-open:rotate-180">
                        ▾
                      </span>
                    </span>
                  </p>
                </summary>
                <div className="border-t border-edge px-4 pb-4 pt-3">
                  <BoxScore
                    home={home}
                    away={away}
                    homeBox={homeBox}
                    awayBox={awayBox}
                  />
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
