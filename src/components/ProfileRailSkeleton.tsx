import { Skeleton } from "@/components/ui/skeleton"

export const ProfileRailSkeleton = () => {
  return (
    <aside className="surface-shell hidden h-full w-full max-w-[var(--right-sidebar-width)] shrink-0 flex-col border-l border-border md:flex">
      <div className="surface-shell flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0 space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="min-w-0 space-y-1">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>

        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </aside>
  )
}
