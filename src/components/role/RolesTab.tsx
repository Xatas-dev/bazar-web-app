import { useGetRoles } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Shield, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RolesTabSkeleton } from "./RolesTabSkeleton";

interface RolesTabProps {
  spaceId: number;
  isCreator?: boolean;
  canCreate?: boolean;
  canRead?: boolean;
  onSelectRole?: (roleId: number) => void;
  onCreateRole?: () => void;
}

export default function RolesTab({
  spaceId,
  isCreator = false,
  canCreate = false,
  canRead = false,
  onSelectRole,
  onCreateRole,
}: RolesTabProps) {
  const { data: rolesResponse, isLoading: isLoadingRoles } = useGetRoles(spaceId);

  const roles = rolesResponse?.roles || [];

  if (isLoadingRoles) {
    return <RolesTabSkeleton />;
  }

  if (!canRead) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          У вас нет прав на просмотр ролей.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Роли</h3>
          <p className="text-sm text-muted-foreground">
            Управляйте уровнями доступа участников спейса
          </p>
          {!isCreator && (
            <p className="mt-1 text-xs text-muted-foreground/70">
              Создание и редактирование ролей доступно только создателю спейса
            </p>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            {canCreate ? (
              <Button size="icon" onClick={onCreateRole}>
                <Plus className="h-4 w-4" />
              </Button>
            ) : (
              <span tabIndex={0}>
                <Button size="icon" disabled onClick={onCreateRole}>
                  <Plus className="h-4 w-4" />
                </Button>
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent side="left">
            {canCreate ? "Добавить роль" : "Добавить роль — доступно только создателю спейса"}
          </TooltipContent>
        </Tooltip>
      </div>

      {!roles || roles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-center text-muted-foreground">Нет ролей. Создайте одну</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <button
                type="button"
                onClick={() => onSelectRole?.(role.id)}
                className={cn(
                  "surface-panel flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  role.isVisible ? "" : "opacity-[var(--panel-disabled-opacity)]"
                )}
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{role.name}</span>
                  {role.description && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
