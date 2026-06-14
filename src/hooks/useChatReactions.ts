import { chatAxiosInstance } from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChatReactionResponse,
  MessageReactionChangeResponse,
  MessageReactionUsersResponse,
} from '@/types/chat';
import {
  toggleMessageReactionInMessage,
  updateChatMessagesCache,
  updateMessageReactionCountInMessage,
  InfiniteChatMessagesData,
} from '@/lib/chat-reactions';

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
    { previousMessages?: InfiniteChatMessagesData }
  >({
    mutationFn: async ({ chatId, messageId, reactionId }) => {
      const response = await chatAxiosInstance.put<MessageReactionChangeResponse>(
        `/chats/${chatId}/messages/${messageId}/reactions/${reactionId}`
      );
      return response.data;
    },
    onMutate: async ({ chatId, messageId, reactionId }) => {
      await queryClient.cancelQueries({ queryKey: ['chat', chatId, 'messages'] });

      const previousMessages = queryClient.getQueryData<InfiniteChatMessagesData>(['chat', chatId, 'messages']);

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
