import Link from "next/link";
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
        className="inline-block rounded-full bg-zinc-700"
        style={{ width: size, height: size }}
      />
    );
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
    />
  );
}

export function TeamLabel({ team, size = 28 }: { team: Team; size?: number }) {
  return (
    <span className="flex items-center gap-2 min-w-0">
      <Avatar avatar={team.avatar} size={size} alt={team.name} />
      <span className="min-w-0">
        <span className="block truncate font-medium">{team.name}</span>
        <span className="block truncate text-xs text-zinc-400">
          {team.ownerName}
        </span>
      </span>
    </span>
  );
}

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 ${className}`}
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

export function StatPill({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-zinc-800/70 px-3 py-2">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function NavTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-600 text-white"
          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
