import { SkeletonCard, SkeletonLine } from "@/components/skeletons";

export default function HomeLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 pt-2">
        <SkeletonLine w="40%" />
        <SkeletonLine w="25%" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={5} />
      </div>
    </div>
  );
}
