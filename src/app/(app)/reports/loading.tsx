import { Skeleton } from "@/components/skeleton";

export default function PageLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
