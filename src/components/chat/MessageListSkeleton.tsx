import { Skeleton } from "@/components/ui/skeleton"

const MessageBubbleSkeleton = ({ alignRight = false }: { alignRight?: boolean }) => (
  <div className={`flex w-full items-end gap-2 ${alignRight ? "flex-row-reverse" : "flex-row"}`}>
    {!alignRight && <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />}
    {alignRight && <div className="w-8 flex-shrink-0" />}
    <div className={`flex flex-col ${alignRight ? "items-end" : "items-start"}`}>
      <Skeleton
        className={`h-14 rounded-[22px] ${alignRight ? "w-52" : "w-64"}`}
      />
    </div>
  </div>
)

export const MessageListSkeleton = () => {
  return (
    <div className="relative z-0 -mt-14 flex-1 min-h-0 overflow-y-auto pt-14 sm:-mt-16 sm:pt-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-3 pb-24 sm:px-6">
        <MessageBubbleSkeleton />
        <MessageBubbleSkeleton alignRight />
        <MessageBubbleSkeleton />
        <MessageBubbleSkeleton alignRight />
        <MessageBubbleSkeleton />
        <MessageBubbleSkeleton />
        <MessageBubbleSkeleton alignRight />
        <MessageBubbleSkeleton />
      </div>
    </div>
  )
}
