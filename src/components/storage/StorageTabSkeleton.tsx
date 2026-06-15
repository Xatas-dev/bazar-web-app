import { Skeleton } from "@/components/ui/skeleton"

const FileRowSkeleton = () => (
  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
    <Skeleton className="h-5 w-5 flex-shrink-0" />
    <div className="min-w-0 flex-1 space-y-1.5">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-72" />
    </div>
    <div className="ml-2 flex flex-shrink-0 items-center gap-2">
      <Skeleton className="h-10 w-10 rounded-md" />
      <Skeleton className="h-10 w-10 rounded-md" />
    </div>
  </div>
)

export const StorageTabSkeleton = () => {
  return (
    <div className="relative z-0 flex h-full min-h-0 flex-col bg-transparent">
      <div className="relative z-10 -mt-14 flex-1 min-h-0 overflow-y-auto pt-14 sm:-mt-16 sm:pt-16">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-3 pb-24 sm:px-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <FileRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
