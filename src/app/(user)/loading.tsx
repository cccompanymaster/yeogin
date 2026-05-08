import { ListSkeleton, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-12">
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
      <ListSkeleton count={8} />
    </div>
  );
}
