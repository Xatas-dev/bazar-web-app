import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageAxiosInstance } from '@/lib/axios';
import { V1GetNodesPaginationResponse, V1GetDownloadUrlResponse, V1GetUploadUrlResponse, V1GetFileStatusResponse } from '@/types/storage';

interface GetNodesParams {
  spaceId: number;
  page?: number;
  pageSize?: number;
}

// API Functions
const getNodes = async ({ spaceId, page = 0, pageSize = 20 }: GetNodesParams): Promise<V1GetNodesPaginationResponse> => {
  const { data } = await storageAxiosInstance.get<V1GetNodesPaginationResponse>(
    `/v1/spaces/${spaceId}/nodes`,
    {
      params: {
        page,
        pageSize,
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

// Получение URL для upload (инициация загрузки)
const getUploadUrl = async ({ spaceId, fileName, size }: { spaceId: number; fileName: string; size: number }) : Promise<V1GetUploadUrlResponse> => {
  const { data } = await storageAxiosInstance.post<V1GetUploadUrlResponse>(
    `/v1/spaces/${spaceId}/nodes`,
    {
      fileName,
      size,
    }
  );
  return data;
};

// Проверка статуса файла
export const getFileStatus = async ({ spaceId, nodeId }: { spaceId: number; nodeId: string }): Promise<V1GetFileStatusResponse> => {
  const { data } = await storageAxiosInstance.get<V1GetFileStatusResponse>(
    `/v1/spaces/${spaceId}/nodes/${nodeId}/status`
  );
  return data;
};

// Hooks

export const useNodes = ({ spaceId, page = 0, pageSize = 20 }: GetNodesParams) => {
  return useQuery({
    queryKey: ['nodes', spaceId, page, pageSize],
    queryFn: () => getNodes({ spaceId, page, pageSize }),
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
    mutationFn: ({ spaceId, fileName, size }: { spaceId: number; fileName: string; size: number }) => getUploadUrl({ spaceId, fileName, size }),
  });
};
