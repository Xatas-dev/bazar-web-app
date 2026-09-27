import { useEffect } from "react";
import { useCreateRole, useUpdateRole, useGetRole } from "@/hooks/useRoles";
import { useRoleEditor } from "@/hooks/useRoleEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AttributeManagePanel from "@/components/role/AttributeManagePanel";
import PermissionCategoryList from "@/components/role/PermissionCategoryList";
import { CreateRoleRequest, SimpleActionDto, UpdateRoleRequest, ActionDto } from "@/types/api";
import { Loader2, Plus, Save, X, ArrowLeft } from "lucide-react";
import { buildSimpleActionPayload, getRoleAttributeKey, parseRoleAttributeSelections } from "@/lib/role-attributes";
import { notify } from "@/lib/notifications";

interface RoleEditorScreenProps {
  spaceId: number;
  roleId?: number;
  allowedActionIds?: number[] | null;
  onBack: () => void;
  onDone: () => void;
}

export default function RoleEditorScreen({
  spaceId,
  roleId,
  allowedActionIds = null,
  onBack,
  onDone,
}: RoleEditorScreenProps) {
  const isEdit = typeof roleId === "number";
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
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const mutation = isEdit ? updateRoleMutation : createRoleMutation;

  useEffect(() => {
    if (isEdit && role) {
      setRoleName(role.name || "");
      setIsVisible(role.isVisible);
      const actionIds = new Set<number>();
      role.actions?.forEach((a) => actionIds.add(a.id));
      setSelectedActions(actionIds);
      setAttributeValues(parseRoleAttributeSelections(role));
    }
  }, [isEdit, role, setRoleName, setIsVisible, setSelectedActions, setAttributeValues]);

  const handleGearClick = (action: ActionDto, rect: DOMRect) => {
    const popupWidth = 288;
    const gap = 8;
    const spaceRight = window.innerWidth - rect.right;
    const x = spaceRight >= popupWidth + gap ? rect.right + gap : rect.left - gap - popupWidth;
    setPopupPos({ x, y: rect.top });
    setGearPopupActionId(gearPopupActionId === action.id ? null : action.id);
  };

  const handleSubmit = () => {
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

    if (isEdit) {
      const payload: UpdateRoleRequest = { name: roleName, isVisible, actions: simpleActions };
      updateRoleMutation.mutate(
        { spaceId, roleId: roleId as number, payload },
        { onSuccess: () => onDone() }
      );
    } else {
      const payload: CreateRoleRequest = { spaceId, name: roleName, isVisible, actions: simpleActions };
      createRoleMutation.mutate(payload, { onSuccess: () => onDone() });
    }
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

  return (
    <div className="flex h-full flex-col">
      <div className="surface-shell flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Назад">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Назад</TooltipContent>
        </Tooltip>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {isEdit ? "Редактирование роли" : "Создание роли"}
          </p>
          <h2 className="truncate text-lg font-semibold sm:text-xl">
            {isEdit ? role?.name || "Role" : "Новая роль"}
          </h2>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-6 p-4 sm:p-6">
          {isEdit && isLoadingRole ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-6 w-12 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="role-editor-name">Название роли</Label>
                <Input
                  id="role-editor-name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="role-editor-visible"
                  checked={isVisible}
                  onCheckedChange={(v) => setIsVisible(v === true)}
                />
                <Label htmlFor="role-editor-visible" className="cursor-pointer text-sm">
                  Сделать роль видимой для пользователей
                </Label>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Права роли</Label>
                  <p className="text-sm text-muted-foreground">
                    Выберите, что участники с этой ролью смогут делать в спейсе
                  </p>
                </div>
                <PermissionCategoryList
                  variant="edit"
                  groupedActions={groupedActions}
                  selectedActions={selectedActions}
                  isActionAllowed={isActionAllowed}
                  onToggleAction={handleActionToggle}
                  onGearClick={handleGearClick}
                />
              </div>
            </>
          )}
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
            <Button variant="outline" size="icon" onClick={onBack} disabled={mutation.isPending}>
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Отмена</TooltipContent>
        </Tooltip>
        {mutation.isPending ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button size="icon" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="left">{isEdit ? "Обновление..." : "Создание..."}</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSubmit} size="icon">
                {isEdit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{isEdit ? "Обновить роль" : "Создать роль"}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
