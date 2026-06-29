import { ActionDto } from "@/types/api";
import { parseCsvNumberSet } from "@/lib/role-attributes";

export const getPermissionKey = (action: Pick<ActionDto, "resource" | "code">) => `${action.resource}:${action.code}`;

export const SPACE_PERMISSIONS = {
  rolesRead: "roles:READ",
  rolesAssign: "roles:ASSIGN",
  rolesEdit: "roles:EDIT",
  rolesCreate: "roles:CREATE",
  spaceDelete: "space:DELETE",
  spaceWrite: "space:WRITE",
  chatRead: "chat_messages:READ",
  chatWrite: "chat_messages:WRITE",
  chatDelete: "chat_messages:DELETE",
  spaceUserAdd: "space_user:ADD",
  spaceUserDelete: "space_user:DELETE",
  storageRead: "storage_node:READ",
  storageUpload:   "storage_node:UPLOAD",
  storageDownload: "storage_node:DOWNLOAD",
  storageDelete:   "storage_node:DELETE",
} as const;

export const getGrantableActionIds = (
  actions: ActionDto[] | undefined,
  permissionKey: string
): number[] | null => {
  const permissionAction = (actions || []).find((action) => getPermissionKey(action) === permissionKey);
  if (!permissionAction) {
    return null;
  }

  const grantableAttr = permissionAction.attributes?.find((attr) => attr.name === "grantable_actions");
  if (!grantableAttr) {
    return null;
  }

  const set = parseCsvNumberSet(grantableAttr.value);
  return Array.from(set);
};


