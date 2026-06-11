import { SkeletonCard, SkeletonTable } from "@/components/skeletons";

// Dashboard skeleton; also the fallback for any tab without its own loading file.
export default function LeagueLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <SkeletonTable rows={10} />
      </div>
      <div className="space-y-6 lg:col-span-2">
        <SkeletonCard lines={6} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
}
