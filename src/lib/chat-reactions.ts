import { MessagePageResponse, MessageReactionResponse, MessageResponse } from '@/types/chat';

export interface InfiniteChatMessagesData {
  pages: MessagePageResponse[];
  pageParams: unknown[];
}

const normalizeReactionId = (reactionId: string | number) => String(reactionId);

const findReactionIndex = (message: MessageResponse, reactionId: string | number) => {
  const normalizedReactionId = normalizeReactionId(reactionId);
  return (message.reactions ?? []).findIndex((reaction) => normalizeReactionId(reaction.reactionId) === normalizedReactionId);
};

const replaceReaction = (
  message: MessageResponse,
  reactionId: string | number,
  updater: (reaction: MessageReactionResponse | undefined) => MessageReactionResponse | null
): MessageResponse => {
  const normalizedReactionId = normalizeReactionId(reactionId);
  const reactions = [...(message.reactions ?? [])];
  const reactionIndex = findReactionIndex(message, normalizedReactionId);
  const currentReaction = reactionIndex >= 0 ? reactions[reactionIndex] : undefined;
  const nextReaction = updater(currentReaction);

  if (!nextReaction) {
    if (reactionIndex < 0) {
      return message;
    }

    reactions.splice(reactionIndex, 1);
    return {
      ...message,
      reactions: reactions.length > 0 ? reactions : undefined,
    };
  }

  if (reactionIndex >= 0) {
    reactions[reactionIndex] = nextReaction;
  } else {
    reactions.push(nextReaction);
  }

  return {
    ...message,
    reactions: reactions.filter((reaction) => reaction.count > 0 || reaction.reactedByMe),
  };
};

export const updateChatMessagesCache = (
  oldData: InfiniteChatMessagesData | undefined,
  updater: (message: MessageResponse) => MessageResponse
) => {
  if (!oldData?.pages) {
    return oldData;
  }

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      content: page.content.map(updater),
    })),
  };
};

export const toggleMessageReactionInMessage = (message: MessageResponse, reactionId: string | number) => {
  let nextCount = 0;
  let nextReactedByMe = false;

  const nextMessage = replaceReaction(message, reactionId, (currentReaction) => {
    const currentCount = currentReaction?.count ?? 0;
    const currentReactedByMe = currentReaction?.reactedByMe ?? false;

    if (currentReactedByMe) {
      nextCount = Math.max(currentCount - 1, 0);
      nextReactedByMe = false;

      if (nextCount === 0) {
        return null;
      }

      return {
        reactionId: normalizeReactionId(reactionId),
        count: nextCount,
        reactedByMe: false,
      };
    }

    nextCount = currentCount + 1;
    nextReactedByMe = true;

    return {
      reactionId: normalizeReactionId(reactionId),
      count: nextCount,
      reactedByMe: true,
    };
  });

  return {
    message: nextMessage,
    nextCount,
    nextReactedByMe,
  };
};

export const updateMessageReactionCountInMessage = (
  message: MessageResponse,
  reactionId: string | number,
  count: number
) => {
  return replaceReaction(message, reactionId, (currentReaction) => {
    if (count <= 0) {
      return null;
    }

    return {
      reactionId: normalizeReactionId(reactionId),
      count,
      reactedByMe: currentReaction?.reactedByMe ?? false,
    };
  });
};

