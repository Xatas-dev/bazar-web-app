import { useMemo, useState } from "react";
import { useGetActions, useGetRoles } from "@/hooks/useRoles";
import { ActionDto } from "@/types/api";
import { getRoleAttributeKey, RoleAttributeSelections } from "@/lib/role-attributes";
import { ActiveAttribute } from "@/components/role/AttributeManagePanel";

export interface UseRoleEditorOptions {
  spaceId: number;
  allowedActionIds?: number[] | null;
}

export function useRoleEditor({ spaceId, allowedActionIds = null }: UseRoleEditorOptions) {
  const [roleName, setRoleName] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [selectedActions, setSelectedActions] = useState<Set<number>>(new Set());
  const [attributeValues, setAttributeValues] = useState<RoleAttributeSelections>({});
  const [gearPopupActionId, setGearPopupActionId] = useState<number | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeAttribute, setActiveAttribute] = useState<ActiveAttribute | null>(null);

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

  const handleActionToggle = (actionId: number) => {
    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (next.has(actionId)) {
        next.delete(actionId);
        setAttributeValues((prevAttr) => {
          const updated = { ...prevAttr };
          delete updated[actionId];
          return updated;
        });
      } else {
        next.add(actionId);
      }
      return next;
    });
  };

  const handleAttributeToggle = (actionId: number, attrName: string, value: number) => {
    const attrKey = getRoleAttributeKey(actionId, attrName);
    setAttributeValues((prev) => {
      const currentSet = prev[attrKey] || new Set<number>();
      const updated = new Set(currentSet);
      if (updated.has(value)) {
        updated.delete(value);
      } else {
        updated.add(value);
      }
      return { ...prev, [attrKey]: updated };
    });
  };

  const handleAttributeToggleAll = (actionId: number, attrName: string, itemIds: number[]) => {
    const attrKey = getRoleAttributeKey(actionId, attrName);
    setAttributeValues((prev) => {
      const currentSet = prev[attrKey] || new Set<number>();
      const allSelected = itemIds.every((id) => currentSet.has(id));
      const updated = new Set(currentSet);
      if (allSelected) {
        for (const id of itemIds) updated.delete(id);
      } else {
        for (const id of itemIds) updated.add(id);
      }
      return { ...prev, [attrKey]: updated };
    });
  };

  return {
    roleName,
    setRoleName,
    isVisible,
    setIsVisible,
    selectedActions,
    setSelectedActions,
    attributeValues,
    setAttributeValues,
    gearPopupActionId,
    setGearPopupActionId,
    popupPos,
    setPopupPos,
    activeAttribute,
    setActiveAttribute,
    actions,
    roles,
    groupedActions,
    isActionAllowed,
    handleActionToggle,
    handleAttributeToggle,
    handleAttributeToggleAll,
  };
}
