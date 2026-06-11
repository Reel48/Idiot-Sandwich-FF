import { SkeletonTable } from "@/components/skeletons";

export default function HistoryLoading() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }, (_, i) => (
        <SkeletonTable key={i} rows={8} />
      ))}
    </div>
  );
}
