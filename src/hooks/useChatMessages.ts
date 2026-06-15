import { chatAxiosInstance } from '@/lib/axios';
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { CreateMessageRequest, DeleteMessagesRequest, MessagePageResponse } from '@/types/chat';
import { removeMessagesFromCache } from '@/lib/chat-reactions';

export interface EditMessageRequest {
  newContent: string;
}

export const useGetChatMessages = (chatId: number | undefined, pageSize = 20) => {
  return useInfiniteQuery<MessagePageResponse, Error>({
    queryKey: ['chat', chatId, 'messages'],
    queryFn: async ({ pageParam = 0 }) => {
      if (!chatId) throw new Error("Chat ID is required");
      const response = await chatAxiosInstance.get<MessagePageResponse>(`/chats/${chatId}/messages`, {
        params: {
          page: pageParam,
          size: pageSize,
          sort: 'createdAt,desc'
        }
      });
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages - 1) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!chatId,
  });
};

export const useCreateMessage = () => {
  return useMutation<void, Error, { chatId: number; data: CreateMessageRequest }>({
    mutationFn: async ({ chatId, data }) => {
      await chatAxiosInstance.post(`/chats/${chatId}/messages`, data);
    },
  });
};

export const useDeleteMessages = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { chatId: number; data: DeleteMessagesRequest }>({
    mutationFn: async ({ chatId, data }) => {
      await chatAxiosInstance.delete(`/chats/${chatId}/messages`, { data });
    },
    onSuccess: (_, { chatId, data }) => {
      queryClient.setQueryData(['chat', chatId, 'messages'], (oldData: any) =>
        removeMessagesFromCache(oldData, data.messageIds)
      );
    },
  });
};

export const useEditMessage = () => {
  return useMutation<void, Error, { chatId: number; messageId: number; data: EditMessageRequest }>({
    mutationFn: async ({ chatId, messageId, data }) => {
      await chatAxiosInstance.patch(`/chats/${chatId}/messages/${messageId}`, data);
    },
  });
};
