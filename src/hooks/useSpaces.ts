import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { AddUserToSpaceDtoRequest } from '@/types/api';
import { GetSpaceDto, GetSpacesResponse } from '@/types/space';

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

const getSpaceUsers = async (spaceId: number): Promise<string[]> => {
  const { data } = await axiosInstance.get<string[]>(`/space/${spaceId}/user`);
  return data;
};

const deleteSpace = async (spaceId: number): Promise<void> => {
  await axiosInstance.delete(`/space/${spaceId}`);
};

const deleteUserFromSpace = async ({ spaceId, userId }: { spaceId: number; userId: string }): Promise<void> => {
  await axiosInstance.delete(`/space/${spaceId}/user/${userId}`);
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
    queryFn: () => getSpaceUsers(spaceId),
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
