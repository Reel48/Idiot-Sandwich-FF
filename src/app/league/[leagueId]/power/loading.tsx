import { SkeletonCard, SkeletonLine } from "@/components/skeletons";

export default function PowerLoading() {
  return (
    <div className="space-y-3">
      <SkeletonLine w="50%" />
      {Array.from({ length: 8 }, (_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}
