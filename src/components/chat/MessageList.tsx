import { useRef, useLayoutEffect, useMemo, useState, useEffect } from "react";
import { useGetChatMessages, useDeleteMessages, useGetChatReactions, useChangeMessageReaction } from "@/hooks/useChat";
import { MessageItem } from "./MessageItem";
import { useUser } from "@/hooks/useUser";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatWebSocket } from "@/hooks/useChatWebSocket.ts";
import { notify } from "@/lib/notifications";
import { MessageResponse, MessageAuthor } from "@/types/chat";
import { MessageReactionUsersDialog } from "./MessageReactionUsersDialog";
import { MessageListSkeleton } from "./MessageListSkeleton";

interface MessageListProps {
  chatId: number;
  onReply?: (message: MessageResponse) => void;
  onEdit?: (message: MessageResponse) => void;
}

const EDGE_THRESHOLD = 16;

export const MessageList = ({ chatId, onReply, onEdit }: MessageListProps) => {
  useChatWebSocket(chatId);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useGetChatMessages(chatId);

  const { data: availableReactions } = useGetChatReactions(chatId);

  const { user: currentUser } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollAdjustmentRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const didInitialAutoScrollRef = useRef(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [selectedReactionMessage, setSelectedReactionMessage] = useState<MessageResponse | null>(null);
  const deleteMessagesMutation = useDeleteMessages();
  const changeReactionMutation = useChangeMessageReaction();

  useEffect(() => {
    setSelectedReactionMessage(null);
  }, [chatId]);

  const reactionLabelById = useMemo(() => {
    if (!availableReactions) return {};
    const map: Record<string, string> = {};
    for (const r of availableReactions) {
      map[r.reactionId] = r.value;
    }
    return map;
  }, [availableReactions]);

  const contactInfoMap = useMemo(() => {
    const map = new Map<string, MessageAuthor>();
    const pages = data?.pages || [];
    for (const page of pages) {
      for (const msg of page.content) {
        if (msg.author && !map.has(String(msg.author.userId))) {
          map.set(String(msg.author.userId), msg.author);
        }
      }
    }
    return map;
  }, [data]);

  const messages = useMemo(() => {
    const pages = data?.pages || [];
    const all = pages.flatMap((page) => page.content || []);
    contactInfoMap.forEach((_, userId) => {
      if (!all.find((m) => String(m.author.userId) === userId)) {
        contactInfoMap.delete(userId);
      }
    });
    return all;
  }, [data, contactInfoMap]);

  const reversedMessages = useMemo(() => {
    return [...messages].reverse();
  }, [messages]);

  const handleDeleteMessage = (messageId: number) => {
    deleteMessagesMutation.mutate(
      { chatId, data: { messageIds: [messageId] } },
      {
        onSuccess: () => {
          notify.success("Message deleted successfully.");
        },
      }
    );
  };

  const handleEditMessage = (message: MessageResponse) => {
    if (onEdit) {
      onEdit(message);
    }
  };

  const handleReact = (messageId: number, reactionId: string) => {
    changeReactionMutation.mutate({ chatId, messageId, reactionId });
  };

  const handleOpenReactionUsers = (message: MessageResponse) => {
    setSelectedReactionMessage(message);
  };

  const handleReactionUsersDialogChange = (open: boolean) => {
    if (!open) {
      setSelectedReactionMessage(null);
    }
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < EDGE_THRESHOLD;

    setShouldAutoScroll(isAtBottom);

    if (hasNextPage && !isFetchingNextPage && scrollTop < EDGE_THRESHOLD) {
      pendingScrollAdjustmentRef.current = { scrollHeight, scrollTop };
      fetchNextPage();
    }
  };

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const saved = pendingScrollAdjustmentRef.current;
    if (saved) {
      const newScrollHeight = container.scrollHeight;
      const heightDiff = newScrollHeight - saved.scrollHeight;
      container.scrollTop = saved.scrollTop + heightDiff;
      pendingScrollAdjustmentRef.current = null;
      return;
    }

    if (!didInitialAutoScrollRef.current) {
      container.scrollTop = container.scrollHeight;
      didInitialAutoScrollRef.current = true;
      return;
    }

    if (shouldAutoScroll) {
      container.scrollTop = container.scrollHeight;
    }
  });

  const loadOlderMessages = () => {
    if (!isFetchingNextPage && hasNextPage) {
      const container = scrollRef.current;
      if (container) {
        pendingScrollAdjustmentRef.current = {
          scrollHeight: container.scrollHeight,
          scrollTop: container.scrollTop,
        };
      }
      fetchNextPage();
    }
  };

  if (isLoading) {
    return <MessageListSkeleton />;
  }

  if (isError) {
    return <div className="text-center text-destructive p-4">Failed to load messages</div>;
  }

  return (
    <>
      <div
          className="relative z-0 -mt-14 flex-1 min-h-0 overflow-y-auto pt-14 message-fade-mask sm:-mt-16 sm:pt-16"
          onScroll={handleScroll}
          ref={scrollRef}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-3 pb-24 scroll-pb-72 sm:px-6">
          {hasNextPage && (
              <div className="flex justify-center py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadOlderMessages}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Load Older Messages
                </Button>
            </div>
        )}

          {reversedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                  <p>No messages yet. Start the conversation!</p>
              </div>
          ) : (
              reversedMessages.map((msg, index) => {
                  const isCurrentUser = msg.author.userId === currentUser?.id;
                  const nextMsg = reversedMessages[index + 1];
                  const showAvatar = !nextMsg || nextMsg.author.userId !== msg.author.userId;
                  const prevMsg = reversedMessages[index - 1];
                  const showAuthorName = !prevMsg || prevMsg.author.userId !== msg.author.userId;

                  return (
                      <MessageItem
                          key={msg.id}
                          message={msg}
                          isCurrentUser={isCurrentUser}
                          showAvatar={showAvatar}
                          showAuthorName={showAuthorName}
                          availableReactions={availableReactions || []}
                          reactionLabelById={reactionLabelById}
                          onDelete={handleDeleteMessage}
                          onReply={onReply}
                          onEdit={handleEditMessage}
                          onReact={handleReact}
                          onOpenReactionUsers={handleOpenReactionUsers}
                      />
                  );
              })
          )}
          <div id="scroll-anchor" />
        </div>
      </div>

      <MessageReactionUsersDialog
        chatId={chatId}
        message={selectedReactionMessage}
        isOpen={!!selectedReactionMessage}
        onOpenChange={handleReactionUsersDialogChange}
        reactionLabelById={reactionLabelById}
      />
    </>
  );
};
