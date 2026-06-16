import { chatAxiosInstance } from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatResponse, CreateChatRequest } from '@/types/chat';

export const useGetChatBySpace = (spaceId: number) => {
  return useQuery<ChatResponse, Error>({
    queryKey: ['chat', 'space', spaceId],
    queryFn: async () => {
      if (!spaceId) throw new Error('Space ID is required');
      const response = await chatAxiosInstance.get<ChatResponse>(`/spaces/${spaceId}/chats`);
      return response.data;
    },
    enabled: !!spaceId,
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation<ChatResponse, Error, CreateChatRequest>({
    mutationFn: async (data) => {
      if (!data.spaceId) throw new Error('Space ID is required');
      const response = await chatAxiosInstance.post<ChatResponse>(`/spaces/${data.spaceId}/chats`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'space', variables.spaceId] });
    },
  });
};
