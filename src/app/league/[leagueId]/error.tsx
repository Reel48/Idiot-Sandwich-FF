"use client";

export default function LeagueError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
      <p className="text-lg font-semibold">Couldn&apos;t load league data</p>
      <p className="mt-2 text-sm text-zinc-400">
        The Sleeper API request failed. The league id may be wrong, or Sleeper
        may be having a moment.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
      >
        Try again
      </button>
    </div>
  );
}
