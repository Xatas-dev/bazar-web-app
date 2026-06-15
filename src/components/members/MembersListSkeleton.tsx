import { Skeleton } from "@/components/ui/skeleton"

const MemberRowSkeleton = () => (
  <div className="surface-panel flex items-center gap-3 rounded-lg px-4 py-3">
    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-1">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-40" />
    </div>
    <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
  </div>
)

export const MembersListSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-28" />
        <div className="relative">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <MemberRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
