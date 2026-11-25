import { useEffect, useRef, useLayoutEffect, useMemo, useState } from "react";
import { useGetChatMessages, useDeleteMessages } from "@/hooks/useChatMessages";
import { useGetChatReactions, useChangeMessageReaction } from "@/hooks/useChatReactions";
import { MessageItem } from "./MessageItem";
import { useUser } from "@/hooks/useUser";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatWebSocket } from "@/hooks/useChatWebSocket.ts";
import { MessageResponse, MessageAuthor } from "@/types/chat";
import { MessageListSkeleton } from "./MessageListSkeleton";

interface MessageListProps {
  spaceId: number;
  chatId: number;
  onReply?: (message: MessageResponse) => void;
  onEdit?: (message: MessageResponse) => void;
  /** Reply/edit banner is showing, so the floating desktop composer is taller */
  hasComposerBanner?: boolean;
  /** Bumped when the user sends a message: jump to the bottom and follow new messages again */
  scrollToBottomKey?: number;
}

const EDGE_THRESHOLD = 16;

export const MessageList = ({ spaceId, chatId, onReply, onEdit, hasComposerBanner = false, scrollToBottomKey = 0 }: MessageListProps) => {
  useChatWebSocket(chatId);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useGetChatMessages(spaceId, chatId);

  const { data: availableReactions } = useGetChatReactions(spaceId, chatId);

  const { user: currentUser } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollAdjustmentRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const didInitialAutoScrollRef = useRef(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const deleteMessagesMutation = useDeleteMessages();
  const changeReactionMutation = useChangeMessageReaction();

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
      { spaceId, chatId, data: { messageIds: [messageId] } },
      {
        onSuccess: () => {
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
    changeReactionMutation.mutate({ spaceId, chatId, messageId, reactionId });
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

  // Messages present when the chat first renders (and older pages loaded later) appear instantly;
  // only messages newer than that fade in, instead of the whole history blinking on every mount
  const animateAfterIdRef = useRef<number | null>(null);
  if (animateAfterIdRef.current === null && !isLoading && data) {
    animateAfterIdRef.current = messages.reduce((max, m) => Math.max(max, m.id), 0);
  }

  // Keep the newest message in view when the list shrinks (on-screen keyboard, reply banner)
  const autoScrollRef = useRef(shouldAutoScroll);
  useEffect(() => {
    autoScrollRef.current = shouldAutoScroll;
  }, [shouldAutoScroll]);

  // Sending (e.g. a reply from the middle of the history) brings the user down to their message.
  // Instant on purpose: a smooth scroll fires intermediate scroll events that would switch
  // auto-scroll back off before the sent message arrives.
  useLayoutEffect(() => {
    if (!scrollToBottomKey) return;
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
    autoScrollRef.current = true;
    setShouldAutoScroll(true);
  }, [scrollToBottomKey]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (autoScrollRef.current) container.scrollTop = container.scrollHeight;
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [isLoading, isError]);

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
    return <div className="text-center text-destructive p-4">Не удалось загрузить сообщения</div>;
  }

  return (
    <>
      <div
          className="relative z-0 -mt-14 flex-1 min-h-0 overflow-y-auto overscroll-contain pt-14 message-fade-mask md:-mt-16 md:pt-16"
          onScroll={handleScroll}
          ref={scrollRef}
      >
        <div
          className={cn(
            "mx-auto flex w-full max-w-4xl flex-col gap-2 px-3 sm:px-6",
            // Room for the floating composer (taller while a reply/edit banner shows)
            hasComposerBanner ? "pb-36 md:pb-40" : "pb-20 md:pb-24"
          )}
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
                    Загрузить старые сообщения
                </Button>
            </div>
        )}

          {reversedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                  <p>Пока нет сообщений. Начните разговор!</p>
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
                          spaceId={spaceId}
                          chatId={chatId}
                          message={msg}
                          isCurrentUser={isCurrentUser}
                          showAvatar={showAvatar}
                          showAuthorName={showAuthorName}
                          animateIn={animateAfterIdRef.current !== null && msg.id > animateAfterIdRef.current}
                          availableReactions={availableReactions || []}
                          reactionLabelById={reactionLabelById}
                          onDelete={handleDeleteMessage}
                          onReply={onReply}
                          onEdit={handleEditMessage}
                          onReact={handleReact}
                      />
                  );
              })
          )}
          <div id="scroll-anchor" />
        </div>
      </div>
    </>
  );
};
