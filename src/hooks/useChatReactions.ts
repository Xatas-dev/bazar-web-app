import { chatAxiosInstance } from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChatReactionResponse,
  MessageReactionChangeResponse,
  MessageReactionUsersResponse,
} from '@/types/chat';
import {
  optimisticToggleMessageReaction,
  updateChatMessagesCache,
  updateMessageReactionInMessage,
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

export const useGetChatReactions = (spaceId: number | undefined, chatId: number | undefined) => {
  return useQuery<ChatReactionResponse[], Error>({
    queryKey: ['chat', chatId, 'reactions'],
    queryFn: async () => {
      if (!spaceId || !chatId) throw new Error('Space ID and Chat ID are required');
      const response = await chatAxiosInstance.get<ChatReactionsApiResponse>(`/v1/spaces/${spaceId}/chats/${chatId}/reactions`);
      return normalizeChatReactionsResponse(response.data);
    },
    enabled: !!spaceId && !!chatId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetMessageReactionUsers = (spaceId: number | undefined, chatId: number | undefined, messageId: number | undefined, enabled = true) => {
  return useQuery<MessageReactionUsersResponse, Error>({
    queryKey: ['chat', chatId, 'messages', messageId, 'reaction-users'],
    queryFn: async () => {
      if (!spaceId || !chatId || !messageId) throw new Error('Space ID, Chat ID and message ID are required');
      const response = await chatAxiosInstance.get<MessageReactionUsersResponse>(
        `/v1/spaces/${spaceId}/chats/${chatId}/messages/${messageId}/reactions/users`
      );
      return response.data;
    },
    enabled: enabled && !!spaceId && !!chatId && !!messageId,
    staleTime: 1000 * 30,
  });
};

export const useChangeMessageReaction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MessageReactionChangeResponse,
    Error,
    { spaceId: number; chatId: number; messageId: number; reactionId: string },
    { previousMessages?: InfiniteChatMessagesData; didOptimisticToggle: boolean }
  >({
    mutationFn: async ({ spaceId, chatId, messageId, reactionId }) => {
      if (!spaceId || !chatId || !messageId) throw new Error("Space ID, Chat ID and Message ID are required");
      const response = await chatAxiosInstance.put<MessageReactionChangeResponse>(
        `/v1/spaces/${spaceId}/chats/${chatId}/messages/${messageId}/reactions/${reactionId}`
      );
      return response.data;
    },
    onMutate: async ({ chatId, messageId, reactionId }) => {
      await queryClient.cancelQueries({ queryKey: ['chat', chatId, 'messages'] });

      const previousMessages = queryClient.getQueryData<InfiniteChatMessagesData>(['chat', chatId, 'messages']);

      let didOptimisticToggle = false;

      queryClient.setQueryData(['chat', chatId, 'messages'], (oldData: any) => {
        if (!oldData) return oldData;
        return updateChatMessagesCache(oldData, (message) => {
          if (message.id !== messageId) return message;

          const myReactionsCount = (message.reactions ?? []).filter(r => r.reactedByMe).length;
          const alreadyReactedWithThis = (message.reactions ?? []).some(
            r => r.reactionId === reactionId && r.reactedByMe
          );

          if (myReactionsCount >= 3 && !alreadyReactedWithThis) {
            return message;
          }

          didOptimisticToggle = true;
          return optimisticToggleMessageReaction(message, reactionId).message;
        });
      });

      return { previousMessages, didOptimisticToggle };
    },
    onError: (_, { chatId }, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', chatId, 'messages'], context.previousMessages);
      }
    },
    onSuccess: (data, { chatId, messageId }, context) => {
      queryClient.setQueryData(['chat', chatId, 'messages'], (oldData: any) => {
        if (!oldData) return oldData;
        return updateChatMessagesCache(oldData, (message) => {
          if (message.id !== messageId) return message;
          const shouldToggle = !context.didOptimisticToggle;
          let updated = message;
          for (const r of data.reactions) {
            updated = updateMessageReactionInMessage(updated, r.reactionId, r.count, shouldToggle);
          }
          return updated;
        });
      });

      queryClient.invalidateQueries({ queryKey: ['chat', chatId, 'messages', messageId, 'reaction-users'] });
    },
  });
};
