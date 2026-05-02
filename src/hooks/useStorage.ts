import { useQuery, useMutation } from '@tanstack/react-query';
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

const getDownloadUrl = async ({ spaceId, fileUuid }: { spaceId: number; fileUuid: string }): Promise<V1GetDownloadUrlResponse> => {
  const { data } = await storageAxiosInstance.get<V1GetDownloadUrlResponse>(
    `/v1/spaces/${spaceId}/nodes/url-for-download`,
    {
      params: {
        fileUuid,
      },
    }
  );
  return data;
};

// Получение URL для upload (инициация загрузки)
const getUploadUrl = async ({ spaceId, fileName, size }: { spaceId: number; fileName: string; size: number }) : Promise<V1GetUploadUrlResponse> => {
  const { data } = await storageAxiosInstance.get<V1GetUploadUrlResponse>(
    `/v1/spaces/${spaceId}/nodes/upload-url`,
    {
      params: {
        fileName,
        size,
      },
    }
  );
  return data;
};

// Проверка статуса файла
export const getFileStatus = async ({ spaceId, fileUuid }: { spaceId: number; fileUuid: string }): Promise<V1GetFileStatusResponse> => {
  const { data } = await storageAxiosInstance.get<V1GetFileStatusResponse>(
    `/v1/spaces/${spaceId}/nodes/status`,
    {
      params: {
        fileUuid,
      },
    }
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
    mutationFn: ({ spaceId, fileUuid }: { spaceId: number; fileUuid: string }) => getDownloadUrl({ spaceId, fileUuid }),
  });
};

export const useInitiateUpload = () => {
  return useMutation({
    mutationFn: ({ spaceId, fileName, size }: { spaceId: number; fileName: string; size: number }) => getUploadUrl({ spaceId, fileName, size }),
  });
};
