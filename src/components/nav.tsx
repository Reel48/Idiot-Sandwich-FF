"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LeagueTabs({
  base,
  tabs,
}: {
  base: string;
  tabs: { slug: string; label: string }[];
}) {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
      {tabs.map((t) => {
        const href = t.slug ? `${base}/${t.slug}` : base;
        const active = t.slug
          ? pathname === href || pathname.startsWith(`${href}/`)
          : pathname === base;
        return (
          <Link
            key={t.slug}
            href={href}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-accent-strong text-white"
                : "text-zinc-400 hover:bg-surface-2 hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function HeaderLeagueLinks({
  leagues,
}: {
  leagues: { href: string; name: string }[];
}) {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
      {leagues.map((l) => {
        const active = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-surface-2 text-white shadow-[inset_0_-2px_0_0_var(--color-accent)]"
                : "text-zinc-400 hover:bg-surface-2 hover:text-white"
            }`}
          >
            {l.name}
          </Link>
        );
      })}
    </nav>
  );
}
