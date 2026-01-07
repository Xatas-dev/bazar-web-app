import { useRef, useEffect, useMemo, useState } from "react";
import { useGetChatMessages } from "@/hooks/useChat";
import { MessageItem } from "./MessageItem";
import { useUser } from "@/hooks/useUser";
import { useUsers } from "@/hooks/useUsers";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {useChatWebSocket} from "@/hooks/useChatWebSocket.ts";

interface MessageListProps {
  chatId: number;
}

export const MessageList = ({ chatId }: MessageListProps) => {
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

  const { user: currentUser } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

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

  // Extract User IDs to fetch user info
  const userIds = useMemo(() => {
    const ids = new Set<string>();
    allMessages.forEach(msg => {
        if (msg.userId) ids.add(msg.userId);
    });
    return Array.from(ids);
  }, [allMessages]);

  const { data: users } = useUsers(userIds);

  // Create a map for easy lookup
  const userMap = useMemo(() => {
    const map = new Map();
    users?.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  // Scroll handling
  // When new messages arrive (at the bottom), if we were at the bottom, auto-scroll to new bottom.
  // When loading older messages (at the top), maintain scroll position?
  // Simple approach: Auto scroll to bottom if we are near bottom.

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages, shouldAutoScroll]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
     // Check if we are at the top to load more
     const target = event.currentTarget;
     if (target.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
         // Save scroll height to restore position
         // const oldScrollHeight = target.scrollHeight;
         fetchNextPage().then(() => {
             // After render, we'd want to adjust scroll position so we don't jump to top
             // But React Query async update makes this tricky without useLayoutEffect or similar.
             // For now, let's just fetch.
             // To prevent jumping, we might need a more complex ScrollArea wrapper or manual logic.
         });
     }

     // Check if we are at bottom
     const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight;
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
                    onClick={() => fetchNextPage()}
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
                const isCurrentUser = msg.userId === currentUser?.id;
                const user = userMap.get(msg.userId);

                // Grouping logic: Show avatar only if previous message was from a different user
                // or if it's the first message
                const prevMsg = allMessages[index - 1];
                const showAvatar = !prevMsg || prevMsg.userId !== msg.userId;

                return (
                    <MessageItem
                        key={msg.id}
                        message={msg}
                        isCurrentUser={isCurrentUser}
                        user={user}
                        showAvatar={showAvatar}
                    />
                );
            })
        )}
        <div id="scroll-anchor" />
    </div>
  );
}
