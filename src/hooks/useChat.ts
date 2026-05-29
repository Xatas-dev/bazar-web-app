import { chatAxiosInstance } from '@/lib/axios';
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChatReactionResponse,
  ChatResponse,
  CreateChatRequest,
  CreateMessageRequest,
  DeleteMessagesRequest,
  MessagePageResponse,
  MessageReactionChangeResponse,
  MessageReactionUsersResponse,
} from '@/types/chat';
import {
  toggleMessageReactionInMessage,
  updateChatMessagesCache,
  updateMessageReactionCountInMessage,
} from '@/lib/chat-reactions';

export interface EditMessageRequest {
  newContent: string;
}

interface ChatMessagesQueryData {
  pages: MessagePageResponse[];
  pageParams: unknown[];
}

type ChatReactionsApiResponse = ChatReactionResponse[] | { reactions?: ChatReactionResponse[] } | { content?: ChatReactionResponse[] } | null | undefined;

const normalizeChatReactionsResponse = (response: ChatReactionsApiResponse): ChatReactionResponse[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === 'object') {
    const maybeReactions = 'reactions' in response ? response.reactions : 'content' in response ? response.content : undefined;
    if (Array.isArray(maybeReactions)) {
      return maybeReactions;
    }
  }

  return [];
};

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

export const useGetChatReactions = (chatId: number | undefined) => {
  return useQuery<ChatReactionResponse[], Error>({
    queryKey: ['chat', chatId, 'reactions'],
    queryFn: async () => {
      if (!chatId) throw new Error('Chat ID is required');
      const response = await chatAxiosInstance.get<ChatReactionsApiResponse>(`/chats/${chatId}/reactions`);
      return normalizeChatReactionsResponse(response.data);
    },
    enabled: !!chatId,
    staleTime: 1000 * 60 * 5,
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

export const useGetMessageReactionUsers = (chatId: number | undefined, messageId: number | undefined, enabled = true) => {
  return useQuery<MessageReactionUsersResponse, Error>({
    queryKey: ['chat', chatId, 'messages', messageId, 'reaction-users'],
    queryFn: async () => {
      if (!chatId || !messageId) throw new Error('Chat ID and message ID are required');
      const response = await chatAxiosInstance.get<MessageReactionUsersResponse>(
        `/chats/${chatId}/messages/${messageId}/reactions/users`
      );
      return response.data;
    },
    enabled: enabled && !!chatId && !!messageId,
    staleTime: 1000 * 30,
  });
};

export const useChangeMessageReaction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MessageReactionChangeResponse,
    Error,
    { chatId: number; messageId: number; reactionId: string },
    { previousMessages?: ChatMessagesQueryData }
  >({
    mutationFn: async ({ chatId, messageId, reactionId }) => {
      const response = await chatAxiosInstance.put<MessageReactionChangeResponse>(
        `/chats/${chatId}/messages/${messageId}/reactions/${reactionId}`
      );
      return response.data;
    },
    onMutate: async ({ chatId, messageId, reactionId }) => {
      await queryClient.cancelQueries({ queryKey: ['chat', chatId, 'messages'] });

      const previousMessages = queryClient.getQueryData<ChatMessagesQueryData>(['chat', chatId, 'messages']);

      queryClient.setQueryData(['chat', chatId, 'messages'], (oldData: any) => {
        if (!oldData) return oldData;
        return updateChatMessagesCache(oldData, (message) => {
          if (message.id !== messageId) return message;
          return toggleMessageReactionInMessage(message, reactionId).message;
        });
      });

      return { previousMessages };
    },
    onError: (_, { chatId }, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', chatId, 'messages'], context.previousMessages);
      }
    },
    onSuccess: (data, { chatId, messageId, reactionId }) => {
      queryClient.setQueryData(['chat', chatId, 'messages'], (oldData: any) => {
        if (!oldData) return oldData;
        return updateChatMessagesCache(oldData, (message) => {
          if (message.id !== messageId) return message;
          return updateMessageReactionCountInMessage(message, reactionId, data.count);
        });
      });

      queryClient.invalidateQueries({ queryKey: ['chat', chatId, 'messages', messageId, 'reaction-users'] });
    },
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

export const useEditMessage = () => {
  return useMutation<void, Error, { chatId: number; messageId: number; data: EditMessageRequest }>({
    mutationFn: async ({ chatId, messageId, data }) => {
      await chatAxiosInstance.patch(`/chats/${chatId}/messages/${messageId}`, data);
    },
    // No need to invalidate queries here - WebSocket will handle the cache update
  });
};
