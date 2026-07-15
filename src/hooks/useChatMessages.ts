import { chatAxiosInstance } from '@/lib/axios';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { CreateMessageRequest, DeleteMessagesRequest, MessagePageResponse } from '@/types/chat';
import { removeMessagesFromCache } from '@/lib/chat-reactions';

export interface EditMessageRequest {
  newContent: string;
}

export const useGetChatMessages = (spaceId: number | undefined, chatId: number | undefined, pageSize = 20) => {
  return useInfiniteQuery<MessagePageResponse, Error>({
    queryKey: ['chat', chatId, 'messages'],
    queryFn: async ({ pageParam = 0 }) => {
      if (!spaceId || !chatId) throw new Error("Space ID and Chat ID are required");
      const response = await chatAxiosInstance.get<MessagePageResponse>(`/v1/spaces/${spaceId}/chats/${chatId}/messages`, {
        params: {
          page: pageParam,
          size: pageSize,
          sort: 'createdAt,desc'
        }
      });
      return response.data;
    },
    staleTime: 0,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages - 1) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!spaceId && !!chatId,
  });
};

export const useCreateMessage = () => {
  return useMutation<void, Error, { spaceId: number; chatId: number; data: CreateMessageRequest }>({
    mutationFn: async ({ spaceId, chatId, data }) => {
      if (!spaceId || !chatId) throw new Error("Space ID and Chat ID are required");
      await chatAxiosInstance.post(`/v1/spaces/${spaceId}/chats/${chatId}/messages`, data);
    },
  });
};

export const useDeleteMessages = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { spaceId: number; chatId: number; data: DeleteMessagesRequest }>({
    mutationFn: async ({ spaceId, chatId, data }) => {
      if (!spaceId || !chatId) throw new Error("Space ID and Chat ID are required");
      await chatAxiosInstance.delete(`/v1/spaces/${spaceId}/chats/${chatId}/messages`, { data });
    },
    onSuccess: (_, { chatId, data }) => {
      queryClient.setQueryData(['chat', chatId, 'messages'], (oldData: any) =>
        removeMessagesFromCache(oldData, data.messageIds)
      );
    },
  });
};

export const useEditMessage = () => {
  return useMutation<void, Error, { spaceId: number; chatId: number; messageId: number; data: EditMessageRequest }>({
    mutationFn: async ({ spaceId, chatId, messageId, data }) => {
      if (!spaceId || !chatId || !messageId) throw new Error("Space ID, Chat ID and Message ID are required");
      await chatAxiosInstance.patch(`/v1/spaces/${spaceId}/chats/${chatId}/messages/${messageId}`, data);
    },
  });
};
