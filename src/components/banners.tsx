import type { Team } from "@/lib/data";
import { Avatar } from "./ui";

export function ChampBanner({
  team,
  season,
  label = "Reigning Champion",
}: {
  team: Team;
  season: string;
  label?: string;
}) {
  return (
    <section className="rounded-card border border-gold/40 bg-gradient-to-br from-amber-500/20 via-surface-1 to-surface-1 p-5">
      <div className="flex items-center gap-4">
        <Avatar avatar={team.avatar} size={64} alt={team.name} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">
            🏆 {label} · {season}
          </p>
          <p className="truncate text-2xl font-black tracking-tight">
            {team.name}
          </p>
          <p className="text-sm text-zinc-400">{team.ownerName}</p>
        </div>
      </div>
    </section>
  );
}

export function ShameBanner({ team, season }: { team: Team; season: string }) {
  return (
    <section className="rounded-card border border-shame/30 bg-gradient-to-br from-red-500/10 via-surface-1 to-surface-1 p-4">
      <div className="flex items-center gap-3">
        <Avatar avatar={team.avatar} size={44} alt={team.name} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-shame">
            🥪 The Idiot Sandwich · {season}
          </p>
          <p className="truncate text-lg font-bold">{team.name}</p>
          <p className="text-xs text-zinc-500">
            Finished dead last. What are you? An idiot sandwich.
          </p>
        </div>
      </div>
    </section>
  );
}
