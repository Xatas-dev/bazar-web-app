import { useGetRole } from "@/hooks/useRoles";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import RoleCard from "./RoleCard";

interface RoleInfoPanelProps {
  spaceId: number;
  roleId: number;
  onBack: () => void;
}

export default function RoleInfoPanel({ spaceId, roleId, onBack }: RoleInfoPanelProps) {
  const { data: role, isLoading } = useGetRole(spaceId, roleId);

  return (
    <div className="flex h-full flex-col">
      <div className="surface-shell flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Назад к ролям">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Информация о роли
          </p>
          <h2 className="truncate text-lg font-semibold sm:text-xl">
            {role?.name || "Role"}
          </h2>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          ) : role ? (
            <RoleCard role={role} spaceId={spaceId} availableActions={role.actions || []} hideMeta />
          ) : (
            <p className="text-sm text-muted-foreground">Роль не найдена.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
