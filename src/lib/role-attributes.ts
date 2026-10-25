import { ActionDto } from "@/types/api";

export const groupActionsByResource = (actions: ActionDto[]): [string, ActionDto[]][] => {
  const map = new Map<string, ActionDto[]>();
  for (const action of actions) {
    const group = action.resourceName || "other";
    if (!map.has(group)) {
      map.set(group, []);
    }
    map.get(group)!.push(action);
  }
  return Array.from(map.entries());
};