import { Skeleton } from "@/components/ui/skeleton"

const SpaceNavItemSkeleton = () => (
  <div className="flex items-center rounded-md px-3 py-2">
    <Skeleton className="mr-2 h-4 w-4" />
    <Skeleton className="h-4 flex-1" />
  </div>
)

export const SpaceListSkeleton = () => {
  return (
    <div className="flex-1 py-4">
      <div className="px-4 space-y-4">
        <nav className="space-y-1">
          <Skeleton className="mb-2 px-2 h-3 w-20" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SpaceNavItemSkeleton key={i} />
          ))}
        </nav>
      </div>
    </div>
  )
}
