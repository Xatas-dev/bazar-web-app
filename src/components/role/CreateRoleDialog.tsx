import { useState } from "react";
import { useCreateRole, useGetRoles } from "@/hooks/useRoles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActionDto, CreateRoleRequest, SimpleActionDto, ActionAttributeDto } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { buildSimpleActionPayload, getRoleAttributeKey, RoleAttributeSelections } from "@/lib/role-attributes";

interface CreateRoleDialogProps {
  spaceId: number;
  actions: ActionDto[];
  allowedActionIds?: number[] | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export default function CreateRoleDialog({
  spaceId,
  actions,
  allowedActionIds = null,
  isOpen,
  onOpenChange,
  children,
}: CreateRoleDialogProps) {
  const [roleName, setRoleName] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [selectedActions, setSelectedActions] = useState<Set<number>>(new Set());
  const [attributeValues, setAttributeValues] = useState<RoleAttributeSelections>({});
  const createRoleMutation = useCreateRole();
  const { data: rolesResponse } = useGetRoles(spaceId, isOpen);
  const { toast } = useToast();

  const roles = rolesResponse?.roles || [];
  const isActionAllowed = (actionId: number) => !allowedActionIds || allowedActionIds.includes(actionId);

  const handleSubmit = async () => {
    if (!roleName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название роли",
        variant: "destructive",
      });
      return;
    }

    if (selectedActions.size === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите хотя бы одно разрешение",
        variant: "destructive",
      });
      return;
    }

    const simpleActions: SimpleActionDto[] = buildSimpleActionPayload({
      selectedActionIds: selectedActions,
      availableActions: actions,
      selections: attributeValues,
    });

    const payload: CreateRoleRequest = {
      spaceId,
      name: roleName,
      isVisible,
      actions: simpleActions,
    };

    createRoleMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Успешно",
          description: "Роль создана",
        });
        resetForm();
        onOpenChange(false);
      },
      onError: () => {
        toast({
          title: "Ошибка",
          description: "Не удалось создать роль",
          variant: "destructive",
        });
      },
    });
  };

  const resetForm = () => {
    setRoleName("");
    setIsVisible(true);
    setSelectedActions(new Set());
    setAttributeValues({});
  };

  const handleActionToggle = (actionId: number) => {
    if (!isActionAllowed(actionId)) {
      return;
    }
    const newSelected = new Set(selectedActions);
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId);
    } else {
      newSelected.add(actionId);
    }
    setSelectedActions(newSelected);
  };

  const handleAttributeToggle = (actionId: number, attrName: string, value: number) => {
    const attrKey = getRoleAttributeKey(actionId, attrName);
    const currentSet = attributeValues[attrKey] || new Set<number>();
    const updatedSet = new Set<number>(currentSet);

    if (updatedSet.has(value)) {
      updatedSet.delete(value);
    } else {
      updatedSet.add(value);
    }

    setAttributeValues({
      ...attributeValues,
      [attrKey]: updatedSet,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Создать новую роль</DialogTitle>
          <DialogDescription>
            Установите название, видимость и выберите разрешения для роли
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-6 pr-4 py-4">
            {/* Role Name */}
            <div className="space-y-2">
              <Label htmlFor="roleName">Название роли</Label>
              <Input
                id="roleName"
                placeholder="например, Модератор, Редактор..."
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>

            {/* Visibility */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVisible"
                checked={isVisible}
                onCheckedChange={(checked: boolean | "indeterminate") => setIsVisible(checked === true)}
              />
              <Label htmlFor="isVisible" className="cursor-pointer">
                Сделать роль видимой для пользователей
              </Label>
            </div>

            {/* Actions Selection */}
            <div className="space-y-3">
              <Label>Разрешения</Label>
              <div className="space-y-2">
                {actions.length > 0 ? (
                  actions.map((action) => (
                    <Card key={action.id} className={`p-3 ${isActionAllowed(action.id) ? '' : 'opacity-60'}`}>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`action-${action.id}`}
                            checked={selectedActions.has(action.id)}
                            onCheckedChange={() => handleActionToggle(action.id)}
                            disabled={!isActionAllowed(action.id)}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`action-${action.id}`}
                              className="cursor-pointer font-medium"
                            >
                              {action.name}
                            </Label>
                            {!isActionAllowed(action.id) && (
                              <p className="text-[11px] text-muted-foreground mt-1">Недоступно для выдачи по вашему набору прав</p>
                            )}
                          </div>
                        </div>

                        {/* Action Attributes */}
                        {action.attributes.length > 0 && (
                          <div className="ml-6 space-y-3 pt-2 border-t">
                            {action.attributes.map((attr: ActionAttributeDto) => {
                              // Check if this is a special attribute
                              if (attr.name === "grantable_actions") {
                                return (
                                  <div key={attr.id} className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      Разрешения которые может выдавать:
                                    </Label>
                                    <div className="space-y-1 ml-2">
                                      {actions.map((a) => (
                                        <div key={a.id} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`grantable-${action.id}-${a.id}`}
                                            checked={attributeValues[getRoleAttributeKey(action.id, "grantable_actions")]?.has(a.id) || false}
                                            onCheckedChange={() => handleAttributeToggle(action.id, "grantable_actions", a.id)}
                                            disabled={!selectedActions.has(action.id) || !isActionAllowed(action.id)}
                                          />
                                          <Label htmlFor={`grantable-${action.id}-${a.id}`} className="text-xs cursor-pointer">
                                            {a.name}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }

                              if (attr.name === "manageable_roles") {
                                return (
                                  <div key={attr.id} className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      Роли которые может управлять:
                                    </Label>
                                    <div className="space-y-1 ml-2">
                                      {roles.map((r) => (
                                        <div key={r.id} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`manageable-${action.id}-${r.id}`}
                                            checked={attributeValues[getRoleAttributeKey(action.id, "manageable_roles")]?.has(r.id) || false}
                                            onCheckedChange={() => handleAttributeToggle(action.id, "manageable_roles", r.id)}
                                            disabled={!selectedActions.has(action.id) || !isActionAllowed(action.id)}
                                          />
                                          <Label htmlFor={`manageable-${action.id}-${r.id}`} className="text-xs cursor-pointer">
                                            {r.name}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }

                              if (attr.name === "assignable_roles") {
                                return (
                                  <div key={attr.id} className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      Роли которые может назначать:
                                    </Label>
                                    <div className="space-y-1 ml-2">
                                      {roles.map((r) => (
                                        <div key={r.id} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`assignable-${action.id}-${r.id}`}
                                            checked={attributeValues[getRoleAttributeKey(action.id, "assignable_roles")]?.has(r.id) || false}
                                            onCheckedChange={() => handleAttributeToggle(action.id, "assignable_roles", r.id)}
                                            disabled={!selectedActions.has(action.id) || !isActionAllowed(action.id)}
                                          />
                                          <Label htmlFor={`assignable-${action.id}-${r.id}`} className="text-xs cursor-pointer">
                                            {r.name}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }

                              // Regular attribute display
                              return (
                                <div key={attr.id}>
                                  • {attr.displayName}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Нет доступных разрешений</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createRoleMutation.isPending}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createRoleMutation.isPending}
          >
            {createRoleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание...
              </>
            ) : (
              "Создать роль"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

