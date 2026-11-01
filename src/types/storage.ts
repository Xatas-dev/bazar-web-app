export interface V1GetNodesAuthorResponse {
  firstName: string | null;
  lastName: string | null;
  status: string | null;
}

export type StorageNodeType = 'FILE' | 'FOLDER';

export interface V1GetNodesResponse {
  nodeId: string;
  nodeName: string | null;
  fileName?: string | null;
  size: number;
  type: StorageNodeType | string;
  uploadedAt: string | null;
  author: V1GetNodesAuthorResponse | null;
  parentId?: string | null;
}

export interface V1GetNodesPaginationResponse {
  content: V1GetNodesResponse[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface V1GetDownloadUrlResponse {
  downloadUrl: string;
}

export interface V1ErrorDetail {
  code: string;
  description: string;
}

export interface V1CreateNodeRequest {
  name: string;
  size?: number;
  type: StorageNodeType;
  parentId: string | null;
}

export interface V1CreateNodeResponse {
  nodeId: string;
  errors?: V1ErrorDetail[];
}

export interface V1GetUploadUrlResponse {
  uploadUrl: string;
  nodeId: string;
  errors?: V1ErrorDetail[];
}

export interface V1GetFileStatusResponse {
  status: string;
  author?: V1GetNodesAuthorResponse | null;
  errors?: V1ErrorDetail[];
}
