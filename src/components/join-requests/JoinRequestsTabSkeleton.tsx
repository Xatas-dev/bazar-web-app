import { Skeleton } from "@/components/ui/skeleton";

const RequestRowSkeleton = () => (
  <div className="surface-panel flex items-center gap-2 rounded-lg p-1.5 pl-3 sm:flex-col sm:items-stretch sm:gap-3 sm:p-3">
    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
      <Skeleton className="h-5 w-5 shrink-0 rounded sm:h-4 sm:w-4" />
      <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
    <div className="flex shrink-0 gap-2 sm:grid sm:grid-cols-2">
      <Skeleton className="h-11 w-11 rounded-md sm:h-9 sm:w-auto" />
      <Skeleton className="h-11 w-11 rounded-md sm:h-9 sm:w-auto" />
    </div>
  </div>
);

export const JoinRequestsTabSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="flex sm:justify-end">
      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
        <Skeleton className="h-11 rounded-md sm:h-9 sm:w-28" />
        <Skeleton className="h-11 rounded-md sm:h-9 sm:w-28" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <RequestRowSkeleton key={i} />
      ))}
    </div>
  </div>
);
