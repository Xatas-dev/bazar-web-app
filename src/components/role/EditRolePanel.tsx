import { useEffect } from "react";
import { useUpdateRole, useGetRole } from "@/hooks/useRoles";
import { useRoleEditor } from "@/hooks/useRoleEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import AttributeManagePanel from "@/components/role/AttributeManagePanel";
import { UpdateRoleRequest, SimpleActionDto } from "@/types/api";
import { ArrowLeft, Settings2, Loader2, Save, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buildSimpleActionPayload, getRoleAttributeKey, parseRoleAttributeSelections } from "@/lib/role-attributes";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/lib/notifications";

interface EditRolePanelProps {
  spaceId: number;
  roleId: number;
  allowedActionIds?: number[] | null;
  onBack: () => void;
}

export default function EditRolePanel({
  spaceId,
  roleId,
  allowedActionIds = null,
  onBack,
}: EditRolePanelProps) {
  const editor = useRoleEditor({ spaceId, allowedActionIds });
  const {
    roleName, setRoleName, isVisible, setIsVisible,
    selectedActions, setSelectedActions,
    attributeValues, setAttributeValues,
    gearPopupActionId, setGearPopupActionId,
    popupPos, setPopupPos,
    activeAttribute, setActiveAttribute,
    actions, roles, groupedActions, isActionAllowed,
    handleActionToggle, handleAttributeToggle, handleAttributeToggleAll,
  } = editor;

  const { data: role, isLoading: isLoadingRole } = useGetRole(spaceId, roleId);
  const updateRoleMutation = useUpdateRole();

  useEffect(() => {
    if (role) {
      setRoleName(role.name || "");
      setIsVisible(role.isVisible);
      const actionIds = new Set<number>();
      role.actions?.forEach((a) => actionIds.add(a.id));
      setSelectedActions(actionIds);
      setAttributeValues(parseRoleAttributeSelections(role));
    }
  }, [role, setRoleName, setIsVisible, setSelectedActions, setAttributeValues]);

  const handleSubmit = async () => {
    if (!roleName.trim()) {
      notify.error.validation("Название роли обязательно.");
      return;
    }
    if (selectedActions.size === 0) {
      notify.error.validation("Выберите хотя бы одно разрешение.");
      return;
    }
    const simpleActions: SimpleActionDto[] = buildSimpleActionPayload({
      selectedActionIds: selectedActions,
      availableActions: actions,
      selections: attributeValues,
    });
    const payload: UpdateRoleRequest = { name: roleName, isVisible, actions: simpleActions };
    updateRoleMutation.mutate(
      { spaceId, roleId, payload },
      {
        onSuccess: () => {
          onBack();
        },
      }
    );
  };

  if (activeAttribute) {
    return (
      <div className="flex h-full flex-col">
        <AttributeManagePanel
          actionId={activeAttribute.actionId}
          actionName={activeAttribute.actionName}
          attr={activeAttribute.attr}
          roles={roles}
          actions={actions}
          attributeValues={attributeValues}
          onToggle={handleAttributeToggle}
          onToggleAll={handleAttributeToggleAll}
          onBack={() => setActiveAttribute(null)}
        />
      </div>
    );
  }

  if (isLoadingRole) {
    return (
      <div className="flex h-full flex-col gap-4 p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-6 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    );
  }

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
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Редактирование роли
          </p>
          <h2 className="truncate text-lg font-semibold sm:text-xl">
            {role?.name || "Role"}
          </h2>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-6 p-4 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="editRoleName">Название роли</Label>
            <Input
              id="editRoleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="editIsVisible"
              checked={isVisible}
              onCheckedChange={(v) => setIsVisible(v === true)}
            />
            <Label htmlFor="editIsVisible" className="cursor-pointer text-sm">
              Сделать роль видимой для пользователей
            </Label>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Разрешения</Label>

            {groupedActions.length > 0 ? (
              groupedActions.map(([resourceName, resourceActions]) => (
                <div key={resourceName}>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {resourceName}
                  </h4>
                  <div className="space-y-1">
                    {resourceActions.map((action) => (
                      <div
                        key={action.id}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                          isActionAllowed(action.id)
                            ? "hover:bg-accent/40"
                            : "opacity-[var(--panel-disabled-opacity)]"
                        }`}
                      >
                        <Checkbox
                          id={`edit-action-${action.id}`}
                          checked={selectedActions.has(action.id)}
                          disabled={!isActionAllowed(action.id)}
                          onCheckedChange={() => handleActionToggle(action.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`edit-action-${action.id}`}
                              className="cursor-pointer text-sm font-medium"
                            >
                              {action.name}
                            </Label>
                            {action.attributes.length > 0 && (
                              <button
                                type="button"
                                disabled={!selectedActions.has(action.id)}
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
                                className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                              >
                                <Settings2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          {!isActionAllowed(action.id) && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Недоступно для редактирования по вашему набору прав
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Нет доступных разрешений</p>
            )}
          </div>
        </div>
      </ScrollArea>

      {gearPopupActionId !== null && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setGearPopupActionId(null)} />
          <div
            className="surface-panel-strong fixed z-50 w-72 rounded-xl border border-border p-2 shadow-lg space-y-1"
            style={{ left: popupPos.x, top: popupPos.y }}
          >
            {actions
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
                        actionName: actions.find((a) => a.id === gearPopupActionId)?.name || "",
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

      <div className="surface-panel-strong flex items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onBack} disabled={updateRoleMutation.isPending}>
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Отмена</TooltipContent>
        </Tooltip>
        {updateRoleMutation.isPending ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button size="icon" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="left">Обновление...</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSubmit} size="icon">
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Обновить роль</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
