export function SkeletonLine({ w = "100%" }: { w?: string }) {
  return (
    <div className="h-4 animate-pulse rounded bg-surface-2" style={{ width: w }} />
  );
}

export function SkeletonCard({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3 rounded-card border border-edge bg-surface-1 p-4">
      <SkeletonLine w="35%" />
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonLine key={i} w={`${90 - (i % 3) * 12}%`} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3 rounded-card border border-edge bg-surface-1 p-4">
      <SkeletonLine w="25%" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-2" />
          <SkeletonLine w={`${55 - (i % 4) * 6}%`} />
          <div className="ml-auto w-20">
            <SkeletonLine />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonPills({ n = 14 }: { n?: number }) {
  return (
    <div className="flex gap-1.5 overflow-hidden">
      {Array.from({ length: n }, (_, i) => (
        <div
          key={i}
          className="h-8 w-9 shrink-0 animate-pulse rounded-md bg-surface-2"
        />
      ))}
    </div>
  );
}
