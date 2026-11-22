import { Skeleton } from "@/components/ui/skeleton"

/** Body of the profile panel while loading: big avatar + name input row (header stays real). */
export const ProfileRailSkeleton = () => {
  return (
    <div className="space-y-8 px-5 pb-6 sm:px-7">
      <div className="flex justify-center pb-4 pt-16">
        <Skeleton className="aspect-square w-1/2 rounded-[var(--space-avatar-radius)]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
  )
}
