"use client";

export default function LeagueError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md rounded-card border border-edge bg-surface-1 p-6 text-center">
      <p className="text-3xl">🥪</p>
      <p className="mt-2 text-lg font-semibold">Couldn&apos;t load league data</p>
      <p className="mt-2 text-sm text-zinc-400">
        The Sleeper API request failed. It&apos;s probably them, not you. Probably.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-accent-strong px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent"
      >
        Run it back
      </button>
    </div>
  );
}
