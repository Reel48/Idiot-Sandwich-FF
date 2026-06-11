import { SkeletonTable } from "@/components/skeletons";

export default function RecordsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonTable rows={10} />
      <SkeletonTable rows={8} />
    </div>
  );
}
