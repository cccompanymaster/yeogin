import { Skeleton, FunLoader } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <div className="ygn-topbar" />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="aspect-[16/10] w-full" />
          <FunLoader message="체험단 상세 정보를 불러오고 있어요…" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <aside className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </aside>
      </div>
    </>
  );
}
