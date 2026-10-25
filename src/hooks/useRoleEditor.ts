import { useMemo, useState } from "react";
import { useGetActions, useGetRoles } from "@/hooks/useRoles";
import { groupActionsByResource } from "@/lib/role-attributes";

export interface UseRoleEditorOptions {
  spaceId: number;
}

export function useRoleEditor({ spaceId }: UseRoleEditorOptions) {
  const [roleName, setRoleName] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [selectedActions, setSelectedActions] = useState<Set<number>>(new Set());

  const { data: actionsData } = useGetActions(spaceId);
  const { data: rolesResponse } = useGetRoles(spaceId);

  const actions = actionsData?.actions || [];
  const roles = rolesResponse?.roles || [];

  const groupedActions = useMemo(() => groupActionsByResource(actions), [actions]);

  const handleActionToggle = (actionId: number) => {
    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (next.has(actionId)) {
        next.delete(actionId);
      } else {
        next.add(actionId);
      }
      return next;
    });
  };

  return {
    roleName,
    setRoleName,
    isVisible,
    setIsVisible,
    selectedActions,
    setSelectedActions,
    actions,
    roles,
    groupedActions,
    handleActionToggle,
  };
}