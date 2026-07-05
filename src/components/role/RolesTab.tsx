import { useGetRoles } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Shield, Info, Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";
import { RolesTabSkeleton } from "./RolesTabSkeleton";
import { notify } from "@/lib/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RolesTabProps {
  spaceId: number;
  canCreate?: boolean;
  canEdit?: boolean;
  canRead?: boolean;
}

export default function RolesTab({
  spaceId,
  canCreate = false,
  canEdit = false,
  canRead = false,
}: RolesTabProps) {
  const { data: rolesResponse, isLoading: isLoadingRoles } = useGetRoles(spaceId);
  const setPanel = useSidebarStore((s) => s.setPanel);

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
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Роли</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Управляйте ролями и разрешениями в спейсе</p>
          </div>
        </div>
        {canCreate ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" onClick={() => setPanel('create-role')}>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Создать роль</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" className="opacity-50" onClick={() => notify.error.forbidden()}>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Создать роль</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {!roles || roles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-center text-muted-foreground">
                    Нет ролей. Создайте одну
                  </p>
            </CardContent>
          </Card>
        ) : (
          roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="w-full"
            >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Card
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent/50",
                    role.isVisible ? "opacity-100" : "opacity-[var(--panel-disabled-opacity)]"
                  )}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium">{role.name}</h3>
                  </CardContent>
                </Card>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-40">
                <DropdownMenuItem onSelect={() => setPanel('role-info', { roleId: role.id })}>
                  <Info className="mr-2 h-4 w-4" />
                  Информация о роли
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!canEdit}
                  onSelect={() => setPanel('edit-role', { roleId: role.id })}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Редактировать роль
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
