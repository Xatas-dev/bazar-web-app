import { useRef, useLayoutEffect, useMemo, useState, useEffect } from "react";
import { useGetChatMessages, useDeleteMessages, useGetChatReactions, useChangeMessageReaction } from "@/hooks/useChat";
import { MessageItem } from "./MessageItem";
import { useUser } from "@/hooks/useUser";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {useChatWebSocket} from "@/hooks/useChatWebSocket.ts";
import { useToast } from "@/hooks/use-toast";
import { MessageResponse } from "@/types/chat";
import { MessageReactionUsersDialog } from "./MessageReactionUsersDialog";

interface MessageListProps {
  chatId: number;
  onReply?: (message: MessageResponse) => void;
  onEdit?: (message: MessageResponse) => void;
}

const EDGE_THRESHOLD = 16;

export const MessageList = ({ chatId, onReply, onEdit }: MessageListProps) => {
  // Connect to WebSocket
  useChatWebSocket(chatId);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useGetChatMessages(chatId);
  const { data: availableReactions = [] } = useGetChatReactions(chatId);
  const changeReactionMutation = useChangeMessageReaction();

  const { user: currentUser } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollAdjustmentRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [selectedReactionMessage, setSelectedReactionMessage] = useState<MessageResponse | null>(null);
  const { toast } = useToast();
  const deleteMessagesMutation = useDeleteMessages();

  useEffect(() => {
    setSelectedReactionMessage(null);
  }, [chatId]);

  const reactionLabelById = useMemo(() => {
    return availableReactions.reduce<Record<string, string>>((acc, reaction) => {
      acc[reaction.reactionId] = reaction.value;
      return acc;
    }, {});
  }, [availableReactions]);

  const handleDeleteMessage = (messageId: number) => {
    deleteMessagesMutation.mutate(
      { chatId, data: { messageIds: [messageId] } },
      {
        onSuccess: () => {
          toast({
            title: "Сообщение удалено",
            description: "Сообщение успешно удалено",
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Не удалось удалить сообщение",
          });
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
    if (!chatId) return;

    const targetMessage = allMessages.find((message) => message.id === messageId);
    if (!targetMessage) return;

    const isAlreadyReacted = targetMessage.reactions?.some(
      (reaction) => reaction.reactionId === reactionId && reaction.reactedByMe
    ) ?? false;
    const userReactionCount = targetMessage.reactions?.filter((reaction) => reaction.reactedByMe).length ?? 0;

    if (!isAlreadyReacted && userReactionCount >= 3) {
      return;
    }

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

  // Flatten messages
  // The backend sorts by createdAt DESC (newest first).
  // Infinite query pages: Page 0 (Newest), Page 1 (Older), etc.
  // We want to display them Chronologically (Oldest -> Newest) in the UI.
  // So we need to reverse the order of pages and messages within pages?
  // Actually, if we get [Newest...Oldest], and we want [Oldest...Newest], we can just reverse the whole flattened array.

  const allMessages = useMemo(() => {
    if (!data) return [];
    // Data is pages of messages. Each page has content: MessageResponse[]
    // If backend returns DESC, then:
    // Page 0: [Msg100, Msg99, Msg98]
    // Page 1: [Msg97, Msg96, Msg95]
    // Flattened: [Msg100...Msg95]
    // Reversed: [Msg95...Msg100] -> Correct chronological order
    const flat = data.pages.flatMap(page => page.content);
    return flat.reverse(); // Now oldest at index 0, newest at last index
  }, [data]);

  // Scroll handling
  // When new messages arrive (at the bottom), if we were at the bottom, auto-scroll to new bottom.
  // When loading older messages (at the top), maintain scroll position.

  useLayoutEffect(() => {
    const container = scrollRef.current;
    const pending = pendingScrollAdjustmentRef.current;

    if (!container || !pending || isFetchingNextPage) {
      return;
    }

    const scrollHeightDelta = container.scrollHeight - pending.scrollHeight;
    container.scrollTop = pending.scrollTop + scrollHeightDelta;
    pendingScrollAdjustmentRef.current = null;
  }, [allMessages, isFetchingNextPage]);

  useLayoutEffect(() => {
    if (shouldAutoScroll && scrollRef.current && !pendingScrollAdjustmentRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages, shouldAutoScroll]);

  const loadOlderMessages = () => {
    const container = scrollRef.current;

    if (!container || !hasNextPage || isFetchingNextPage) {
      return;
    }

    pendingScrollAdjustmentRef.current = {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
    };

    fetchNextPage();
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
     // Check if we are at the top to load more
     const target = event.currentTarget;
     if (target.scrollTop <= EDGE_THRESHOLD && hasNextPage && !isFetchingNextPage) {
         loadOlderMessages();
     }

     // Check if we are at bottom
     const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= EDGE_THRESHOLD;
     setShouldAutoScroll(isAtBottom);
  };

  // Actually, Radix ScrollArea is a bit weird with onScroll directly on the component.
  // We might need to access the viewport ref.
  // Let's rely on a "Load More" button at the top for simplicity if infinite scroll is jumpy,
  // OR we use a standard div with overflow-y-auto instead of ScrollArea for the list container to have better control.
  // I will use a standard div for the list to ensure onScroll works predictably.

  if (isLoading) {
    return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>;
  }

  if (isError) {
      return <div className="text-center text-red-500 p-4">Failed to load messages</div>;
  }

  return (
    <>
      <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          onScroll={handleScroll}
          ref={scrollRef} // This ref won't work on the custom ScrollArea easily if we don't access viewport
          // So I'm using a plain div for the scroll container inside the tab content
      >
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

          {allMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                  <p>No messages yet. Start the conversation!</p>
              </div>
          ) : (
              allMessages.map((msg, index) => {
                  const isCurrentUser = msg.author.userId === currentUser?.id;

                  // Grouping logic: Show avatar only if previous message was from a different user
                  // or if it's the first message
                  const prevMsg = allMessages[index - 1];
                  const showAvatar = !prevMsg || prevMsg.author.userId !== msg.author.userId;

                  return (
                      <MessageItem
                          key={msg.id}
                          message={msg}
                          isCurrentUser={isCurrentUser}
                          showAvatar={showAvatar}
                          availableReactions={availableReactions}
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

      <MessageReactionUsersDialog
        chatId={chatId}
        message={selectedReactionMessage}
        isOpen={!!selectedReactionMessage}
        onOpenChange={handleReactionUsersDialogChange}
        reactionLabelById={reactionLabelById}
      />
    </>
  );
}
