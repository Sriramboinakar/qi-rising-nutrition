import { Skeleton } from "@/components/skeleton";

export default function ClientTabLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
