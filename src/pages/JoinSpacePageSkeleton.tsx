import { Skeleton } from "@/components/ui/skeleton";

export default function JoinSpacePageSkeleton() {
  return (
    <div className="flex flex-col items-center gap-8" aria-busy="true" aria-label="Загрузка приглашения">
      <div className="w-40 pt-4 sm:w-48">
        <Skeleton className="aspect-square w-full rounded-[var(--space-avatar-radius)]" />
      </div>
      <div className="flex w-full flex-col items-center gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-56" />
      </div>
      <Skeleton className="h-11 w-full rounded-full sm:w-52" />
    </div>
  );
}
