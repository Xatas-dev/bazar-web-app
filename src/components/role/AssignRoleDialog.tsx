import { useState } from "react";
import { useAssignRoleToUser, useGetRoles } from "@/hooks/useRoles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { notify } from "@/lib/notifications";

interface AssignRoleDialogProps {
  spaceId: number;
  userId: string;
  userName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AssignRoleDialog({
  spaceId,
  userId,
  userName,
  isOpen,
  onOpenChange,
}: AssignRoleDialogProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const { data: rolesResponse, isLoading } = useGetRoles(spaceId, isOpen);
  const assignRoleMutation = useAssignRoleToUser();

  const roles = rolesResponse?.roles || [];

  const handleSubmit = async () => {
    if (!selectedRoleId) {
      notify.error.validation("Select a role to assign.");
      return;
    }

    assignRoleMutation.mutate(
      {
        spaceId,
        userId,
        roleId: Number(selectedRoleId),
      },
      {
        onSuccess: () => {
          notify.success(`Role assigned to ${userName}.`);
          setSelectedRoleId("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Назначить роль</DialogTitle>
          <DialogDescription>
            Выберите роль для пользователя <span className="font-semibold">{userName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ) : !roles || roles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Нет доступных ролей. Создайте роль для назначения.
            </p>
          ) : (
            <RadioGroup value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <div className="space-y-2">
                {roles.map((role) => (
                  <Card
                    key={role.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedRoleId(String(role.id))}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem
                          value={String(role.id)}
                          id={`role-${role.id}`}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`role-${role.id}`}
                          className="cursor-pointer flex-1"
                        >
                          <div className="font-medium">{role.name || "Без названия"}</div>
                          <div className="text-xs text-muted-foreground">
                            {role.isVisible ? 'Видима' : 'Скрыта'}
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assignRoleMutation.isPending}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={assignRoleMutation.isPending || !selectedRoleId}
          >
            {assignRoleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Назначение...
              </>
            ) : (
              "Назначить"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

