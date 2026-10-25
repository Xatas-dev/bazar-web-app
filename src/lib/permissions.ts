import { ActionDto } from "@/types/api";

export const getPermissionKey = (action: Pick<ActionDto, "resource" | "code">) => `${action.resource}:${action.code}`;

export const SPACE_PERMISSIONS = {
  rolesRead: "roles:READ",
  rolesAssign: "roles:ASSIGN",
  rolesEdit: "roles:MANAGE",
  rolesCreate: "roles:MANAGE",
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


