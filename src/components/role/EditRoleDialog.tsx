import { useState, useEffect } from "react";
import { useUpdateRole, useGetRole, useGetActions, useGetRoles } from "@/hooks/useRoles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UpdateRoleRequest, SimpleActionDto, ActionDto, ActionAttributeDto } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  buildSimpleActionPayload,
  getRoleAttributeKey,
  parseRoleAttributeSelections,
  RoleAttributeSelections,
} from "@/lib/role-attributes";

interface EditRoleDialogProps {
  spaceId: number;
  roleId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allowedActionIds?: number[] | null;
}

export default function EditRoleDialog({
  spaceId,
  roleId,
  isOpen,
  onOpenChange,
  allowedActionIds = null,
}: EditRoleDialogProps) {
  const [roleName, setRoleName] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [selectedActions, setSelectedActions] = useState<Set<number>>(new Set());
  const [attributeValues, setAttributeValues] = useState<RoleAttributeSelections>({});

  const { data: role, isLoading: isLoadingRole } = useGetRole(spaceId, roleId);
  const { data: actionsData } = useGetActions(spaceId);
  const { data: rolesResponse } = useGetRoles(spaceId, isOpen);
  const updateRoleMutation = useUpdateRole();
  const { toast } = useToast();
  const allActions = actionsData?.actions || [];
  const isActionAllowed = (actionId: number) => !allowedActionIds || allowedActionIds.includes(actionId);

  // Load role data when it changes
  useEffect(() => {
    if (role) {
      setRoleName(role.name || "");
      setIsVisible(role.isVisible);

      // Populate selected actions from role
      const actionIds = new Set<number>();
      role.actions?.forEach(action => {
        actionIds.add(action.id);
      });
      setSelectedActions(actionIds);
      setAttributeValues(parseRoleAttributeSelections(role));
    }
  }, [role]);

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
      availableActions: allActions,
      selections: attributeValues,
    });

    const payload: UpdateRoleRequest = {
      name: roleName,
      isVisible,
      actions: simpleActions,
    };

    updateRoleMutation.mutate(
      { spaceId, roleId, payload },
      {
        onSuccess: () => {
          toast({
            title: "Успешно",
            description: "Роль обновлена",
          });
          onOpenChange(false);
        },
        onError: () => {
          toast({
            title: "Ошибка",
            description: "Не удалось обновить роль",
            variant: "destructive",
          });
        },
      }
    );
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
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Редактировать роль</DialogTitle>
          <DialogDescription>
            Обновите название, видимость и разрешения для роли
          </DialogDescription>
        </DialogHeader>

        {isLoadingRole ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-6 pr-4 py-4">
                {/* Role Name */}
                <div className="space-y-2">
                  <Label htmlFor="editRoleName">Название роли</Label>
                  <Input
                    id="editRoleName"
                    placeholder="например, Модератор, Редактор..."
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>

                {/* Visibility */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="editIsVisible"
                    checked={isVisible}
                    onCheckedChange={(checked: boolean | "indeterminate") => setIsVisible(checked === true)}
                  />
                  <Label htmlFor="editIsVisible" className="cursor-pointer">
                    Сделать роль видимой для пользователей
                  </Label>
                </div>

                {/* Actions Selection */}
                <div className="space-y-3">
                  <Label>Разрешения</Label>
                  <div className="space-y-2">
                    {allActions.length > 0 ? (
                      allActions.map((action: ActionDto) => (
                        <Card key={action.id} className={`p-3 ${isActionAllowed(action.id) ? '' : 'opacity-60'}`}>
                          <div className="space-y-2">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id={`edit-action-${action.id}`}
                                checked={selectedActions.has(action.id)}
                                onCheckedChange={() => handleActionToggle(action.id)}
                                disabled={!isActionAllowed(action.id)}
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={`edit-action-${action.id}`}
                                  className="cursor-pointer font-medium"
                                >
                                  {action.name}
                                </Label>
                                {!isActionAllowed(action.id) && (
                                  <p className="text-[11px] text-muted-foreground mt-1">Недоступно для редактирования по вашему набору прав</p>
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
                                          {allActions.map((a) => (
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
                                          {(rolesResponse?.roles || []).map((r) => (
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
                                          {(rolesResponse?.roles || []).map((r) => (
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
                disabled={updateRoleMutation.isPending}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обновление...
                  </>
                ) : (
                  "Обновить роль"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

