import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export const GuestPageSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-20 py-20 px-4">
      <section className="text-center space-y-6 max-w-3xl">
        <Skeleton className="mx-auto h-14 w-96" />
        <Skeleton className="mx-auto h-6 w-full max-w-xl" />
        <Skeleton className="mx-auto h-6 w-80" />
        <div className="pt-4 flex justify-center">
          <Skeleton className="h-12 w-44 rounded-md" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-10 w-10 mb-2" />
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
