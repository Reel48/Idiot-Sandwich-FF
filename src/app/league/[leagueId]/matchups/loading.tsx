import { SkeletonCard, SkeletonPills } from "@/components/skeletons";

export default function MatchupsLoading() {
  return (
    <div className="space-y-4">
      <SkeletonPills n={16} />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    </div>
  );
}
