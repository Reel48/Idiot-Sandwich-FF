import { SkeletonCard } from "@/components/skeletons";

export default function AwardsLoading() {
  return (
    <div className="space-y-4">
      <SkeletonCard lines={4} />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} lines={6} />
        ))}
      </div>
    </div>
  );
}
