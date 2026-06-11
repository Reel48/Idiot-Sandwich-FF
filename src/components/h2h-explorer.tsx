"use client";

import { useState } from "react";
import { Avatar, fmtPts } from "./ui";

export interface H2HOpponent {
  ownerId: string;
  wins: number;
  losses: number;
  ties: number;
  pf: number;
  pa: number;
}

export interface H2HFranchise {
  ownerId: string;
  name: string;
  ownerName: string;
  avatar: string | null;
  opponents: H2HOpponent[];
}

const rec = (c: { wins: number; losses: number; ties: number }) =>
  c.ties ? `${c.wins}-${c.losses}-${c.ties}` : `${c.wins}-${c.losses}`;

const winPct = (c: { wins: number; losses: number; ties: number }) => {
  const total = c.wins + c.losses + c.ties;
  return total ? (c.wins + c.ties / 2) / total : 0;
};

function PctBadge({ pct }: { pct: number }) {
  const cls =
    pct > 0.5
      ? "bg-accent/10 text-accent"
      : pct < 0.5
        ? "bg-shame/10 text-shame"
        : "bg-surface-2 text-zinc-400";
  return (
    <span
      className={`inline-block w-14 rounded-full px-2 py-0.5 text-center font-mono text-xs ${cls}`}
    >
      {(pct * 100).toFixed(0)}%
    </span>
  );
}

export function H2HExplorer({ franchises }: { franchises: H2HFranchise[] }) {
  const [selectedId, setSelectedId] = useState(franchises[0]?.ownerId);
  const selected = franchises.find((f) => f.ownerId === selectedId);
  if (!selected) return null;

  const byId = new Map(franchises.map((f) => [f.ownerId, f]));
  const rows = [...selected.opponents].sort(
    (a, b) => winPct(b) - winPct(a) || b.wins - a.wins,
  );
  const totals = rows.reduce(
    (acc, o) => ({
      wins: acc.wins + o.wins,
      losses: acc.losses + o.losses,
      ties: acc.ties + o.ties,
      pf: acc.pf + o.pf,
      pa: acc.pa + o.pa,
    }),
    { wins: 0, losses: 0, ties: 0, pf: 0, pa: 0 },
  );
  const totalDiff = totals.pf - totals.pa;

  return (
    <div>
      {/* Team picker rail */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar sm:mx-0 sm:flex-wrap sm:px-0">
        {franchises.map((f) => {
          const active = f.ownerId === selectedId;
          return (
            <button
              key={f.ownerId}
              onClick={() => setSelectedId(f.ownerId)}
              className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors ${
                active
                  ? "border-accent bg-accent/10 text-white"
                  : "border-edge bg-surface-2 text-zinc-400 hover:border-edge-strong hover:text-white"
              }`}
            >
              <Avatar avatar={f.avatar} size={26} alt={f.name} />
              <span className="max-w-[110px] truncate">{f.ownerName}</span>
            </button>
          );
        })}
      </div>

      {/* Selected team summary */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg bg-surface-2 px-3 py-2.5">
        <Avatar avatar={selected.avatar} size={36} alt={selected.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{selected.name}</p>
          <p className="text-xs text-zinc-500">{selected.ownerName}</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-semibold">{rec(totals)}</p>
          <p
            className={`font-mono text-xs ${
              totalDiff > 0
                ? "text-accent"
                : totalDiff < 0
                  ? "text-shame"
                  : "text-zinc-500"
            }`}
          >
            {totalDiff >= 0 ? "+" : ""}
            {fmtPts(totalDiff)} all-time
          </p>
        </div>
      </div>

      {/* Per-opponent rows */}
      <ul className="divide-y divide-edge">
        {rows.map((o) => {
          const opp = byId.get(o.ownerId);
          if (!opp) return null;
          const diff = o.pf - o.pa;
          return (
            <li key={o.ownerId}>
              <button
                onClick={() => setSelectedId(o.ownerId)}
                className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-surface-2/50"
                title={`Switch to ${opp.ownerName}`}
              >
                <Avatar avatar={opp.avatar} size={32} alt={opp.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {opp.name}
                  </span>
                  <span className="block truncate text-xs text-zinc-500">
                    {opp.ownerName}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-mono text-sm font-semibold">
                    {rec(o)}
                  </span>
                  <span
                    className={`block font-mono text-xs ${
                      diff > 0
                        ? "text-accent"
                        : diff < 0
                          ? "text-shame"
                          : "text-zinc-500"
                    }`}
                  >
                    {diff >= 0 ? "+" : ""}
                    {fmtPts(diff)}
                  </span>
                </span>
                <PctBadge pct={winPct(o)} />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-zinc-500">
        Regular-season games across all linked seasons. Point swing is total
        scored minus conceded in those games. Tap an opponent to flip the view.
      </p>
    </div>
  );
}
