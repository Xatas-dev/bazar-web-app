import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

const RoleCardSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <Skeleton className="h-5 w-40" />
    </CardContent>
  </Card>
)

export const RolesTabSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <RoleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
