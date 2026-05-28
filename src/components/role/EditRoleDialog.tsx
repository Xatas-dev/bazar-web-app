import { useState, useEffect } from "react";
import { useUpdateRole, useGetRole, useGetActions, useGetRoles } from "@/hooks/useRoles";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleToggle } from "@/components/ui/circle-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import AttributeManagePanel, { ActiveAttribute } from "@/components/role/AttributeManagePanel";
import { UpdateRoleRequest, SimpleActionDto, ActionDto } from "@/types/api";
import { Settings2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/lib/notifications";
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
  const [gearPopupActionId, setGearPopupActionId] = useState<number | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeAttribute, setActiveAttribute] = useState<ActiveAttribute | null>(null);

  const { data: role, isLoading: isLoadingRole } = useGetRole(spaceId, roleId);
  const { data: actionsData } = useGetActions(spaceId);
  const { data: rolesResponse } = useGetRoles(spaceId, isOpen);
  const updateRoleMutation = useUpdateRole();
  const allActions = actionsData?.actions || [];
  const roles = rolesResponse?.roles || [];
  const isActionAllowed = (actionId: number) => !allowedActionIds || allowedActionIds.includes(actionId);

  useEffect(() => {
    if (role) {
      setRoleName(role.name || "");
      setIsVisible(role.isVisible);
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
      notify.error.validation("Role name is required.");
      return;
    }
    if (selectedActions.size === 0) {
      notify.error.validation("Select at least one permission.");
      return;
    }
    const simpleActions: SimpleActionDto[] = buildSimpleActionPayload({
      selectedActionIds: selectedActions,
      availableActions: allActions,
      selections: attributeValues,
    });
    const payload: UpdateRoleRequest = { name: roleName, isVisible, actions: simpleActions };
    updateRoleMutation.mutate(
      { spaceId, roleId, payload },
      {
        onSuccess: () => { notify.success("Role updated successfully."); onOpenChange(false); },
      }
    );
  };

  const handleActionToggle = (actionId: number) => {
    if (!isActionAllowed(actionId)) return;
    const next = new Set(selectedActions);
    next.has(actionId) ? next.delete(actionId) : next.add(actionId);
    setSelectedActions(next);
  };

  const handleAttributeToggle = (actionId: number, attrName: string, value: number) => {
    const attrKey = getRoleAttributeKey(actionId, attrName);
    const updated = new Set(attributeValues[attrKey] || []);
    updated.has(value) ? updated.delete(value) : updated.add(value);
    setAttributeValues({ ...attributeValues, [attrKey]: updated });
  };

  const handleAttributeToggleAll = (actionId: number, attrName: string, itemIds: number[]) => {
    const attrKey = getRoleAttributeKey(actionId, attrName);
    const currentSet = attributeValues[attrKey] || new Set<number>();
    const allSelected = itemIds.every((id) => currentSet.has(id));
    const updated = new Set(currentSet);
    if (allSelected) {
      for (const id of itemIds) updated.delete(id);
    } else {
      for (const id of itemIds) updated.add(id);
    }
    setAttributeValues({ ...attributeValues, [attrKey]: updated });
  };

  // Active attribute panel view
  if (activeAttribute) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0">
          <AttributeManagePanel
            actionId={activeAttribute.actionId}
            actionName={activeAttribute.actionName}
            attr={activeAttribute.attr}
            roles={roles}
            actions={allActions}
            attributeValues={attributeValues}
            onToggle={handleAttributeToggle}
            onToggleAll={handleAttributeToggleAll}
            onBack={() => setActiveAttribute(null)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Редактировать роль</DialogTitle>
          <DialogDescription>Обновите название, видимость и разрешения для роли</DialogDescription>
        </DialogHeader>

        {isLoadingRole ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-6 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-6 pr-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editRoleName">Название роли</Label>
                  <Input
                    id="editRoleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <CircleToggle id="editIsVisible" checked={isVisible} onCheckedChange={setIsVisible} />
                  <Label htmlFor="editIsVisible" className="cursor-pointer">Сделать роль видимой для пользователей</Label>
                </div>

                <div className="space-y-3">
                  <Label>Разрешения</Label>
                  <div className="space-y-2">
                    {allActions.length > 0 ? (
                      allActions.map((action: ActionDto) => (
                        <div
                          key={action.id}
                          className={`rounded-lg border border-border p-3 ${
                            isActionAllowed(action.id) ? '' : 'opacity-[var(--panel-disabled-opacity)]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <CircleToggle
                              id={`edit-action-${action.id}`}
                              checked={selectedActions.has(action.id)}
                              onCheckedChange={() => handleActionToggle(action.id)}
                              disabled={!isActionAllowed(action.id)}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`edit-action-${action.id}`} className="cursor-pointer text-sm font-medium">
                                  {action.name}
                                </Label>
                                {action.attributes.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                      const popupWidth = 288;
                                      const gap = 8;
                                      const spaceRight = window.innerWidth - rect.right;
                                      const x = spaceRight >= popupWidth + gap
                                        ? rect.right + gap
                                        : rect.left - gap - popupWidth;
                                      setPopupPos({ x, y: rect.top });
                                      setGearPopupActionId(gearPopupActionId === action.id ? null : action.id);
                                    }}
                                    className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                  >
                                    <Settings2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                              {!isActionAllowed(action.id) && (
                                <p className="text-[11px] text-muted-foreground mt-1">Недоступно для редактирования по вашему набору прав</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Нет доступных разрешений</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Gear popup at click position */}
            {gearPopupActionId !== null && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setGearPopupActionId(null)} />
                <div
                  className="surface-panel-strong fixed z-50 w-72 rounded-xl border border-border p-2 shadow-lg space-y-1"
                  style={{ left: popupPos.x, top: popupPos.y }}
                >
                  {allActions
                    .find((a) => a.id === gearPopupActionId)
                    ?.attributes.map((attr) => {
                      const count = attributeValues[getRoleAttributeKey(gearPopupActionId, attr.name)]?.size || 0;
                      return (
                        <button
                          key={attr.id}
                          type="button"
                          onClick={() => {
                            setActiveAttribute({
                              actionId: gearPopupActionId,
                              actionName: allActions.find((a) => a.id === gearPopupActionId)?.name || "",
                              attr,
                            });
                            setGearPopupActionId(null);
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-accent ${
                            count > 0 ? "bg-primary/10" : ""
                          }`}
                        >
                          <span className="flex-1 text-left">{attr.displayName}</span>
                          {count > 0 && (
                            <span className="text-xs font-medium text-primary">{count}</span>
                          )}
                        </button>
                      );
                    })}
                </div>
              </>
            )}

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateRoleMutation.isPending}>
                Отмена
              </Button>
              <Button onClick={handleSubmit} disabled={updateRoleMutation.isPending}>
                {updateRoleMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Обновление...</>
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

