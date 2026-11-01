import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageAxiosInstance } from '@/lib/axios';
import {
  V1CreateNodeRequest,
  V1CreateNodeResponse,
  V1GetNodesPaginationResponse,
  V1GetDownloadUrlResponse,
  V1GetUploadUrlResponse,
  V1GetFileStatusResponse,
  StorageNodeType,
} from '@/types/storage';

interface GetNodesParams {
  spaceId: number;
  page?: number;
  pageSize?: number;
  parentId?: string | null;
}

const getNodes = async ({ spaceId, page = 0, pageSize = 20, parentId = null }: GetNodesParams): Promise<V1GetNodesPaginationResponse> => {
  const { data } = await storageAxiosInstance.get<V1GetNodesPaginationResponse>(
    `/v1/spaces/${spaceId}/nodes`,
    {
      params: {
        page,
        pageSize,
        parentId,
      },
    }
  );
  return data;
};

const getDownloadUrl = async ({ spaceId, nodeId }: { spaceId: number; nodeId: string }): Promise<V1GetDownloadUrlResponse> => {
  const { data } = await storageAxiosInstance.get<V1GetDownloadUrlResponse>(
    `/v1/spaces/${spaceId}/nodes/${nodeId}/download`
  );
  return data;
};

const deleteNode = async ({ spaceId, nodeId }: { spaceId: number; nodeId: string }): Promise<void> => {
  await storageAxiosInstance.delete(`/v1/spaces/${spaceId}/nodes/${nodeId}`);
};

const createNode = async ({ spaceId, name, size, type, parentId }: V1CreateNodeRequest & { spaceId: number }): Promise<V1CreateNodeResponse> => {
  const { data } = await storageAxiosInstance.post<V1CreateNodeResponse>(`/v1/spaces/${spaceId}/nodes`, {
    name,
    ...(size !== undefined ? { size } : {}),
    type,
    parentId,
  });
  return data;
};

const getUploadUrl = async ({ spaceId, nodeId }: { spaceId: number; nodeId: string }): Promise<V1GetUploadUrlResponse> => {
  const { data } = await storageAxiosInstance.get<V1GetUploadUrlResponse>(`/v1/spaces/${spaceId}/nodes/${nodeId}/upload`);
  return data;
};

const moveNode = async ({
  spaceId,
  nodeId,
  parentId,
}: {
  spaceId: number;
  nodeId: string;
  parentId: string | null;
}): Promise<void> => {
  await storageAxiosInstance.patch(`/v1/spaces/${spaceId}/nodes/${nodeId}`, {
    parentId,
  });
};

export const getFileStatus = async ({ spaceId, nodeId }: { spaceId: number; nodeId: string }): Promise<V1GetFileStatusResponse> => {
  const { data } = await storageAxiosInstance.get<V1GetFileStatusResponse>(`/v1/spaces/${spaceId}/nodes/${nodeId}/status`);
  return data;
};

export const useNodes = ({ spaceId, page = 0, pageSize = 20, parentId = null }: GetNodesParams) => {
  return useQuery({
    queryKey: ['nodes', spaceId, parentId, page, pageSize],
    queryFn: () => getNodes({ spaceId, page, pageSize, parentId }),
  });
};

export const useDownloadUrl = () => {
  return useMutation({
    mutationFn: ({ spaceId, nodeId }: { spaceId: number; nodeId: string }) => getDownloadUrl({ spaceId, nodeId }),
  });
};

export function useDeleteNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spaceId, nodeId }: { spaceId: number; nodeId: string }) => deleteNode({ spaceId, nodeId }),
    onMutate: async ({ spaceId, nodeId }) => {
      await queryClient.cancelQueries({ queryKey: ['nodes', spaceId] });

      const previousData = queryClient.getQueriesData<V1GetNodesPaginationResponse>({ queryKey: ['nodes', spaceId] });

      queryClient.setQueriesData<V1GetNodesPaginationResponse>(
        { queryKey: ['nodes', spaceId] },
        (old: V1GetNodesPaginationResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.filter((file) => file.nodeId !== nodeId),
            totalElements: Math.max(0, old.totalElements - 1),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: (_data, _err, { spaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['nodes', spaceId] });
    },
  });
};

export const useInitiateUpload = () => {
  return useMutation({
    mutationFn: ({ spaceId, fileName, size, parentId = null }: { spaceId: number; fileName: string; size: number; parentId?: string | null }) =>
      createNode({ spaceId, name: fileName, size, type: 'FILE' as StorageNodeType, parentId })
    ,
  });
};

export const useCreateNode = () => {
  return useMutation({
    mutationFn: ({
      spaceId,
      name,
      type,
      parentId,
      size,
    }: {
      spaceId: number;
      name: string;
      type: StorageNodeType;
      parentId?: string | null;
      size?: number;
    }) => createNode({ spaceId, name, type, parentId: parentId ?? null, size }),
  });
};

export const useMoveNode = () => {
  return useMutation({
    mutationFn: ({ spaceId, nodeId, parentId }: { spaceId: number; nodeId: string; parentId: string | null }) =>
      moveNode({ spaceId, nodeId, parentId }),
  });
};

export const useUploadUrl = () => {
  return useMutation({
    mutationFn: ({ spaceId, nodeId }: { spaceId: number; nodeId: string }) => getUploadUrl({ spaceId, nodeId }),
  });
};
