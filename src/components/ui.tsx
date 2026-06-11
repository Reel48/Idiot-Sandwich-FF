import type { Team } from "@/lib/data";
import { avatarUrl } from "@/lib/sleeper/api";

export const fmtPts = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const record = (t: { wins: number; losses: number; ties: number }) =>
  t.ties ? `${t.wins}-${t.losses}-${t.ties}` : `${t.wins}-${t.losses}`;

export function Avatar({
  avatar,
  size = 32,
  alt = "",
}: {
  avatar: string | null;
  size?: number;
  alt?: string;
}) {
  const url = avatarUrl(avatar);
  if (!url)
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-surface-3 text-zinc-500"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        🥪
      </span>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      className="shrink-0 rounded-full"
    />
  );
}

export function TeamLabel({ team, size = 28 }: { team: Team; size?: number }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar avatar={team.avatar} size={size} alt={team.name} />
      <span className="min-w-0">
        <span className="block truncate font-medium">{team.name}</span>
        <span className="block truncate text-xs text-zinc-500">
          {team.ownerName}
        </span>
      </span>
    </span>
  );
}

const CARD_TONES = {
  default: "border-edge bg-surface-1",
  gold: "border-gold/40 bg-gradient-to-br from-amber-500/15 via-surface-1 to-surface-1",
  shame:
    "border-shame/30 bg-gradient-to-br from-red-500/10 via-surface-1 to-surface-1",
} as const;

export function Card({
  title,
  children,
  className = "",
  tone = "default",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  tone?: keyof typeof CARD_TONES;
}) {
  return (
    <section
      className={`rounded-card border p-4 transition-colors ${CARD_TONES[tone]} ${className}`}
    >
      {title && (
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: "default" | "accent" | "gold" | "shame";
}) {
  const valueColor = {
    default: "text-zinc-100",
    accent: "text-accent",
    gold: "text-gold",
    shame: "text-shame",
  }[tone];
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${valueColor}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

export function RankBadge({ rank, total }: { rank: number; total: number }) {
  const style =
    rank === 1
      ? "border-gold/40 bg-gold/15 text-gold"
      : rank === 2
        ? "border-zinc-500/40 bg-zinc-500/15 text-zinc-300"
        : rank === 3
          ? "border-amber-700/50 bg-amber-700/20 text-amber-500"
          : rank === total
            ? "border-shame/40 bg-shame/10 text-shame"
            : "border-edge bg-surface-2 text-zinc-400";
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold ${style}`}
    >
      {rank}
    </span>
  );
}

export function EmptyState({
  emoji = "🥪",
  title,
  hint,
}: {
  emoji?: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="font-medium text-zinc-300">{title}</p>
      {hint && <p className="max-w-sm text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}
