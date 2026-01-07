import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { GetUserSpacesDtoResponse, AddUserToSpaceDtoRequest } from '@/types/api';

// API Functions
const getSpaces = async (): Promise<GetUserSpacesDtoResponse> => {
  const { data } = await axiosInstance.get<GetUserSpacesDtoResponse>('/space');
  return data;
};

const createSpace = async (): Promise<number> => {
  // The spec says POST /space takes no body and returns int64
  const { data } = await axiosInstance.post<number>('/space');
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
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
