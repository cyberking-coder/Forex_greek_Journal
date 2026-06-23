import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="container-marketing py-10">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-7 w-44" />
      <Skeleton className="mt-6 h-14 w-full rounded-xl" />
      <div className="mt-6 flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="mt-4">
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}
