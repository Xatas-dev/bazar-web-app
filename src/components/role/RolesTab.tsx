import { useState } from "react";
import { useGetRoles, useGetActions } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Shield } from "lucide-react";
import CreateRoleDialog from "./CreateRoleDialog";
import EditRoleDialog from "./EditRoleDialog";
import ViewRoleDialog from "./ViewRoleDialog";
import { useToast } from "@/hooks/use-toast";

interface RolesTabProps {
  spaceId: number;
  canCreate?: boolean;
  canEdit?: boolean;
  canRead?: boolean;
  createGrantableActionIds?: number[] | null;
  editGrantableActionIds?: number[] | null;
}

export default function RolesTab({
  spaceId,
  canCreate = false,
  canEdit = false,
  canRead = false,
  createGrantableActionIds = null,
  editGrantableActionIds = null,
}: RolesTabProps) {
  const { data: rolesResponse, isLoading: isLoadingRoles } = useGetRoles(spaceId);
  const { data: actionsData } = useGetActions(spaceId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewRoleId, setViewRoleId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const roles = rolesResponse?.roles || [];
  const actions = actionsData?.actions || [];

  if (isLoadingRoles) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
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

  const handleEditRole = (roleId: number) => {
    if (canEdit) {
      setEditRoleId(roleId);
      setIsEditDialogOpen(true);
    } else {
      // open view-only dialog
      setViewRoleId(roleId);
      setIsViewDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Роли</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Управляйте ролями и разрешениями для вашего пространства</p>
          </div>
        </div>
        {canCreate ? (
          <CreateRoleDialog
            spaceId={spaceId}
            actions={actions}
            allowedActionIds={createGrantableActionIds}
            onOpenChange={setIsCreateDialogOpen}
            isOpen={isCreateDialogOpen}
          >
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Создать роль
            </Button>
          </CreateRoleDialog>
        ) : (
          <Button className="w-full sm:w-auto opacity-50" onClick={() => toast({ title: "Нет прав", description: "У вас нет прав на создание ролей", variant: 'destructive' })}>
            <Plus className="mr-2 h-4 w-4" /> Создать роль
          </Button>
        )}
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {!roles || roles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-center text-muted-foreground">
                Ролей еще нет. Создайте первую роль, чтобы начать управление разрешениями.
              </p>
            </CardContent>
          </Card>
        ) : (
          roles.map((role) => (
            <Card
              key={role.id}
              className={`hover:shadow-md transition-shadow ${canEdit ? 'cursor-pointer' : 'cursor-pointer'}`}
              style={{opacity: role.isVisible ? 1 : 0.5}}
              onClick={() => handleEditRole(role.id)}
            >
              <CardContent className="p-4">
                <h3 className="font-medium">{role.name}</h3>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Role Dialog */}
      {editRoleId && (
        <EditRoleDialog
          spaceId={spaceId}
          roleId={editRoleId}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          allowedActionIds={editGrantableActionIds}
        />
      )}
      {viewRoleId && (
        <ViewRoleDialog
          spaceId={spaceId}
          roleId={viewRoleId}
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          hideMeta
        />
      )}
    </div>
  );
}

