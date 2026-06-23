import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-marketing py-10">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}
