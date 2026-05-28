import { useMemo, useState } from "react";
import { useCreateRole, useGetActions, useGetRoles } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleToggle } from "@/components/ui/circle-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import AttributeManagePanel, { ActiveAttribute } from "@/components/role/AttributeManagePanel";
import { ActionDto, CreateRoleRequest, SimpleActionDto } from "@/types/api";
import { Loader2, ArrowLeft, Settings2, Plus, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buildSimpleActionPayload, getRoleAttributeKey, RoleAttributeSelections } from "@/lib/role-attributes";
import { notify } from "@/lib/notifications";

interface CreateRolePanelProps {
  spaceId: number;
  allowedActionIds?: number[] | null;
  onBack: () => void;
}

export default function CreateRolePanel({
  spaceId,
  allowedActionIds = null,
  onBack,
}: CreateRolePanelProps) {
  const [roleName, setRoleName] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [selectedActions, setSelectedActions] = useState<Set<number>>(new Set());
  const [attributeValues, setAttributeValues] = useState<RoleAttributeSelections>({});
  const [gearPopupActionId, setGearPopupActionId] = useState<number | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeAttribute, setActiveAttribute] = useState<ActiveAttribute | null>(null);
  const createRoleMutation = useCreateRole();
  const { data: actionsData } = useGetActions(spaceId);
  const { data: rolesResponse } = useGetRoles(spaceId);

  const actions = actionsData?.actions || [];
  const roles = rolesResponse?.roles || [];
  const isActionAllowed = (actionId: number) => !allowedActionIds || allowedActionIds.includes(actionId);

  const groupedActions = useMemo(() => {
    const map = new Map<string, ActionDto[]>();
    for (const action of actions) {
      const group = action.resourceName || "other";
      if (!map.has(group)) {
        map.set(group, []);
      }
      map.get(group)!.push(action);
    }
    return Array.from(map.entries());
  }, [actions]);

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
        notify.success("Role created successfully.");
        resetForm();
        onBack();
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

  const handleAttributeToggleAll = (actionId: number, attrName: string, itemIds: number[]) => {
    const attrKey = getRoleAttributeKey(actionId, attrName);
    const currentSet = attributeValues[attrKey] || new Set<number>();
    const allSelected = itemIds.every((id) => currentSet.has(id));
    const updatedSet = new Set<number>(currentSet);
    if (allSelected) {
      for (const id of itemIds) updatedSet.delete(id);
    } else {
      for (const id of itemIds) updatedSet.add(id);
    }
    setAttributeValues({
      ...attributeValues,
      [attrKey]: updatedSet,
    });
  };

  // Active attribute panel view
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
      {/* Header */}
      <div className="surface-shell flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to roles">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Back</TooltipContent>
        </Tooltip>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Create role
          </p>
          <h2 className="truncate text-lg font-semibold sm:text-xl">
            New Role
          </h2>
        </div>
      </div>

      {/* Form */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-6 p-4 sm:p-6">
          {/* Role Name */}
          <div className="space-y-2">
            <Label htmlFor="roleName">Название роли</Label>
            <Input
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3">
            <CircleToggle
              id="isVisible"
              checked={isVisible}
              onCheckedChange={setIsVisible}
            />
            <Label htmlFor="isVisible" className="cursor-pointer text-sm">
              Сделать роль видимой для пользователей
            </Label>
          </div>

          {/* Actions Selection — grouped by resourceName */}
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
                        className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                          isActionAllowed(action.id)
                            ? "hover:bg-accent/40"
                            : "opacity-[var(--panel-disabled-opacity)]"
                        }`}
                      >
                        <CircleToggle
                          id={`action-${action.id}`}
                          checked={selectedActions.has(action.id)}
                          disabled={!isActionAllowed(action.id)}
                          onCheckedChange={() => handleActionToggle(action.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`action-${action.id}`}
                              className="cursor-pointer text-sm font-medium"
                            >
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
                                  setGearPopupActionId(
                                    gearPopupActionId === action.id ? null : action.id
                                  );
                                }}
                                className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                              >
                                <Settings2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          {!isActionAllowed(action.id) && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Недоступно для выдачи по вашему набору прав
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

      {/* Gear popup at click position */}
      {gearPopupActionId !== null && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setGearPopupActionId(null)} />
          <div
            className="surface-panel-strong fixed z-50 w-72 rounded-xl border border-border p-2 shadow-lg space-y-1 animate-in fade-in-0 zoom-in-95 duration-150"
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

      {/* Footer */}
      <div className="surface-panel-strong flex items-center justify-end gap-3 border-t border-border px-4 py-4 sm:px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              disabled={createRoleMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Cancel</TooltipContent>
        </Tooltip>
        {createRoleMutation.isPending ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button size="icon" disabled>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="left">Creating...</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSubmit} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Create role</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

