import { LeagueTabs } from "@/components/nav";
import { ESPN_ERA } from "@/lib/espn/data";

const TABS = [
  { slug: "", label: "History" },
  { slug: "records", label: "Records" },
];

export default function EspnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-2 text-2xl">
          📼
        </span>
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-black tracking-tight">
            <span className="truncate">The ESPN Era</span>
            <span className="rounded-full border border-edge bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
              Archived
            </span>
          </h1>
          <p className="text-sm text-zinc-400">
            {ESPN_ERA.leagueName} · {ESPN_ERA.first}–{ESPN_ERA.last}, before
            the move to Sleeper
          </p>
        </div>
      </div>
      <div className="border-b border-edge">
        <LeagueTabs base="/espn" tabs={TABS} />
      </div>
      {children}
    </div>
  );
}
