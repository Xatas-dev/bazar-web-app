import { Skeleton } from "@/components/ui/skeleton"

const NodeRowSkeleton = () => (
  <div className="flex items-center gap-3 px-3 py-2.5">
    <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
    <div className="min-w-0 flex-1 space-y-1.5">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  </div>
)

/** Mirrors StorageTab: path line, one list panel, floating action bar. */
export const StorageTabSkeleton = () => {
  return (
    <div className="relative flex h-full min-h-0 flex-col" aria-hidden>
      <div className="relative z-0 -mt-14 min-h-0 flex-1 overflow-hidden pt-14 md:-mt-16 md:pt-16">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="surface-panel divide-y divide-[hsl(var(--panel-border))] overflow-hidden rounded-lg">
            {Array.from({ length: 7 }).map((_, i) => (
              <NodeRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 md:bottom-6">
        <div className="mx-auto w-full max-w-4xl px-3 md:px-6">
          <div className="surface-panel-muted flex items-center gap-2 rounded-lg p-1.5 pl-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
