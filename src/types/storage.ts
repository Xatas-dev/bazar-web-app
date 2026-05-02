export interface V1GetNodesAuthorResponse {
  firstName: string | null;
  lastName: string | null;
  status: string | null;
}

export interface V1GetNodesResponse {
  fileUuid: string;
  fileName: string | null;
  size: number;
  type: string;
  uploadedAt: string | null;
  author: V1GetNodesAuthorResponse | null;
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

export interface V1GetUploadUrlResponse {
  uploadUrl: string;
  fileUuid: string;
}

export interface V1GetFileStatusResponse {
  status: string;
}
