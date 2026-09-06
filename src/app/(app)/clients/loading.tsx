import { Skeleton } from "@/components/skeleton";

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-11 w-36" />
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}