import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function TradesLoading() {
  return (
    <div className="container-marketing py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="mt-6 flex gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="mt-4">
        <TableSkeleton rows={8} />
      </div>
    </div>
  );
}
