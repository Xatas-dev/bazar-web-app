import { Skeleton } from "@/components/ui/skeleton"
import { MessageListSkeleton } from "./MessageListSkeleton"

export const ChatTabSkeleton = () => {
  return (
    <div className="relative flex h-full min-h-0 flex-col bg-transparent">
      <MessageListSkeleton />

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30">
        <div className="mx-auto w-full max-w-4xl px-3 sm:px-6">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
