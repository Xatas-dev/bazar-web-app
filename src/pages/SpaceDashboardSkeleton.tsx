import { Skeleton } from "@/components/ui/skeleton"

export const SpaceDashboardSkeleton = () => {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-clip">
      <div className="surface-shell relative z-20 flex-shrink-0 border-b border-border px-2 sm:px-4 py-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6" />
          <Skeleton className="h-7 w-48 sm:h-8" />
          <Skeleton className="h-4 w-4 flex-shrink-0" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 sm:px-6 sm:pb-6">
        <div className="mt-4 flex min-h-[400px] flex-1 items-center justify-center">
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}
