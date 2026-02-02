import { chatAxiosInstance } from '@/lib/axios';
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChatResponse,
  CreateChatRequest,
  CreateMessageRequest,
  MessagePageResponse,
  DeleteMessagesRequest
} from '@/types/chat';

// --- Chat Hooks ---

export const useGetChatBySpace = (spaceId: number) => {
  return useQuery<ChatResponse, Error>({
    queryKey: ['chat', 'space', spaceId],
    queryFn: async () => {
      const response = await chatAxiosInstance.get<ChatResponse>(`/chats`, {
        params: { spaceId }
      });
      return response.data;
    },
    enabled: !!spaceId,
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  return useMutation<ChatResponse, Error, CreateChatRequest>({
    mutationFn: async (data) => {
      const response = await chatAxiosInstance.post<ChatResponse>('/chats', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'space', variables.spaceId] });
    },
  });
};

// --- Message Hooks ---

export const useGetChatMessages = (chatId: number | undefined, pageSize = 20) => {
  return useInfiniteQuery<MessagePageResponse, Error>({
    queryKey: ['chat', chatId, 'messages'],
    queryFn: async ({ pageParam = 0 }) => {
      if (!chatId) throw new Error("Chat ID is required");
      const response = await chatAxiosInstance.get<MessagePageResponse>(`/chats/${chatId}/messages`, {
        params: {
          page: pageParam,
          size: pageSize,
          sort: 'createdAt,desc' // We want newest first for chat usually, but let's see how the backend sorts.
          // If backend sorts by createdAt asc by default, we might need to reverse in UI or request desc.
          // Usually chat is loaded newest at bottom. Infinite scroll goes UP to load OLDER messages.
          // So we want the "latest" page first? Or the "last" page?
          // Standard pattern: Get page 0 sorted by createdAt DESC. This gives the NEWEST messages.
          // Then page 1 gives older messages.
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
    // No need to invalidate queries here - WebSocket will handle the cache update
  });
};

export const useDeleteMessages = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { chatId: number; data: DeleteMessagesRequest }>({
    mutationFn: async ({ chatId, data }) => {
      await chatAxiosInstance.delete(`/chats/${chatId}/messages`, { data });
    },
    onSuccess: (_, { chatId, data }) => {
      // Immediately remove deleted messages from cache after successful DELETE
      const deletedIds = new Set(data.messageIds);

      queryClient.setQueryData(['chat', chatId, 'messages'], (oldData: any) => {
        if (!oldData) return oldData;

        // Filter out deleted messages from all pages
        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          content: page.content.filter((msg: any) => !deletedIds.has(msg.id))
        }));

        return {
          ...oldData,
          pages: newPages
        };
      });
    },
  });
};
