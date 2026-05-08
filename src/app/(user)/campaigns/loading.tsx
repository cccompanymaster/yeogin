import { ListSkeleton, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="h-8 w-48" />
        <div className="mt-2"><Skeleton className="h-4 w-32" /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <ListSkeleton count={12} />
    </div>
  );
}
