import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { AvatarUploadError } from '@/lib/avatar-upload';
import { AddUserToSpaceDtoRequest, AvatarUploadRequestDto } from '@/types/api';
import {
  GetSpaceAvatarsResponse,
  GetSpaceDto,
  GetSpacesResponse,
  GetUsersInSpaceResponse,
  SpaceAvatarDto,
  SpaceAvatarUploadTicketDtoResponse,
} from '@/types/space';

// API Functions
const getSpaces = async (): Promise<GetSpacesResponse> => {
  const { data } = await axiosInstance.get<GetSpacesResponse>('/space');
  return data;
};

const createSpace = async (name: string): Promise<GetSpaceDto> => {
  const { data } = await axiosInstance.post<GetSpaceDto>('/space', {}, {
    params: { name }
  });
  return data;
};

const patchSpace = async ({ spaceId, name }: { spaceId: number; name: string }): Promise<GetSpaceDto> => {
  const { data } = await axiosInstance.patch<GetSpaceDto>(`/space/${spaceId}`, {}, {
    params: { name }
  });
  return data;
};

const addUserToSpace = async (payload: AddUserToSpaceDtoRequest): Promise<void> => {
  await axiosInstance.post('/space/user', payload);
};

const getSpaceUsersEnriched = async (spaceId: number): Promise<GetUsersInSpaceResponse> => {
  const { data } = await axiosInstance.get<GetUsersInSpaceResponse>(`/spaces/${spaceId}/users`);
  return data;
};

const deleteSpace = async (spaceId: number): Promise<void> => {
  await axiosInstance.delete(`/space/${spaceId}`);
};

const deleteUserFromSpace = async ({ spaceId, userId }: { spaceId: number; userId: string }): Promise<void> => {
  await axiosInstance.delete(`/space/${spaceId}/user/${userId}`);
};

const initiateSpaceAvatarUpload = async (
  spaceId: number,
  payload: AvatarUploadRequestDto
): Promise<SpaceAvatarUploadTicketDtoResponse> => {
  const { data } = await axiosInstance.post<SpaceAvatarUploadTicketDtoResponse>(`/space/${spaceId}/avatar`, payload);
  return data;
};

const getSpaceAvatars = async (spaceId: number): Promise<GetSpaceAvatarsResponse> => {
  const { data } = await axiosInstance.get<GetSpaceAvatarsResponse>(`/space/${spaceId}/avatar`);
  return data;
};

const AVATAR_POLL_INTERVAL_MS = 2000;
const AVATAR_POLL_TIMEOUT_MS = 60000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Poll GET /space/{spaceId}/avatar until the avatar with `avatarId` leaves PENDING.
const pollSpaceAvatar = async (spaceId: number, avatarId: number): Promise<SpaceAvatarDto> => {
  const start = Date.now();

  while (Date.now() - start < AVATAR_POLL_TIMEOUT_MS) {
    await delay(AVATAR_POLL_INTERVAL_MS);
    const { avatars = [] } = await getSpaceAvatars(spaceId);
    const avatar = avatars.find((a) => a.id === avatarId);

    if (avatar?.status === 'SUCCESS' && avatar.url) return avatar;
    if (avatar?.status === 'ERROR') {
      throw new AvatarUploadError('Не удалось обработать изображение. Попробуйте другой файл.');
    }
  }

  throw new AvatarUploadError('Обработка изображения заняла слишком много времени. Попробуйте ещё раз.');
};

// Hooks

export const useSpaces = () => {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: getSpaces,
  });
};

export const useCreateSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSpace,
    onSuccess: (newSpace) => {
      queryClient.setQueryData(['spaces'], (oldData: GetSpacesResponse | undefined) => {
        if (!oldData) return { spaces: [newSpace] };
        return {
          ...oldData,
          spaces: [...oldData.spaces, newSpace]
        };
      });
    },
  });
};

export const usePatchSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchSpace,
    onSuccess: (updatedSpace) => {
      queryClient.setQueryData(['spaces'], (oldData: GetSpacesResponse | undefined) => {
        if (!oldData) return { spaces: [updatedSpace] };
        return {
          ...oldData,
          spaces: oldData.spaces.map(s => s.id === updatedSpace.id ? updatedSpace : s)
        };
      });
    }
  });
};

export const useAddUserToSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addUserToSpace,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['space-users', variables.spaceId] });
    },
  });
};

export const useSpaceUsers = (spaceId: number) => {
  return useQuery({
    queryKey: ['space-users', spaceId],
    queryFn: () => getSpaceUsersEnriched(spaceId),
    enabled: !!spaceId,
  });
};

export const useDeleteSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSpace,
    onSuccess: (_, spaceId) => {
      queryClient.setQueryData(['spaces'], (oldData: GetSpacesResponse | undefined) => {
        if (!oldData) return { spaces: [] };
        return {
          ...oldData,
          spaces: oldData.spaces.filter(s => s.id !== spaceId)
        };
      });
    },
  });
};

export const useDeleteUserFromSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserFromSpace,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['space-users', variables.spaceId] });
    },
  });
};

export const useUploadSpaceAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ spaceId, file }: { spaceId: number; file: File }): Promise<SpaceAvatarDto> => {
      if (!file.type.startsWith('image/')) {
        throw new AvatarUploadError('Выберите файл изображения.');
      }

      // 1. Ask bazar-space for an avatarId and a pre-signed upload URL
      const { avatarId, uploadUrl } = await initiateSpaceAvatarUpload(spaceId, {
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      // 2. PUT the binary directly to storage
      let putResponse: Response;
      try {
        putResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
      } catch {
        throw new AvatarUploadError('Не удалось загрузить файл в хранилище. Проверьте подключение.');
      }
      if (!putResponse.ok) {
        throw new AvatarUploadError('Не удалось загрузить файл в хранилище.');
      }

      // 3. Wait until the backend has processed the avatar
      return pollSpaceAvatar(spaceId, avatarId);
    },
    onSuccess: (avatar, { spaceId }) => {
      queryClient.setQueryData(['spaces'], (oldData: GetSpacesResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          spaces: oldData.spaces.map((s) => (s.id === spaceId ? { ...s, avatarUrl: avatar.url } : s)),
        };
      });
    },
  });
};
