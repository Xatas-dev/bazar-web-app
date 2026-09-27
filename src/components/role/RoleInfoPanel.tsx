import { useGetActions, useGetRole } from "@/hooks/useRoles";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Pencil } from "lucide-react";
import { groupActionsByResource } from "@/lib/role-attributes";
import PermissionCategoryList from "./PermissionCategoryList";

interface RoleInfoPanelProps {
  spaceId: number;
  roleId: number;
  canEdit?: boolean;
  onBack: () => void;
  onEdit?: () => void;
}

export default function RoleInfoPanel({
  spaceId,
  roleId,
  canEdit = false,
  onBack,
  onEdit,
}: RoleInfoPanelProps) {
  const { data: actionsData, isLoading: isLoadingActions } = useGetActions(spaceId);
  const { data: role, isLoading: isLoadingRole } = useGetRole(spaceId, roleId);

  const actions = actionsData?.actions || [];
  const groupedActions = groupActionsByResource(actions);
  const grantedActionIds = new Set<number>((role?.actions || []).map((a) => a.id));
  const isLoading = isLoadingActions || isLoadingRole;

  return (
    <div className="flex h-full flex-col">
      <div className="surface-shell flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Назад к ролям">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Назад</TooltipContent>
        </Tooltip>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Информация о роли
          </p>
          <h2 className="truncate text-lg font-semibold sm:text-xl">
            {role?.name || "Role"}
          </h2>
        </div>
        {canEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Редактировать роль">
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Редактировать роль</TooltipContent>
          </Tooltip>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-4 p-4 sm:p-6">
          <h3 className="text-base font-semibold">Права роли</h3>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
          ) : (
            <PermissionCategoryList
              variant="read"
              groupedActions={groupedActions}
              grantedActionIds={grantedActionIds}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
