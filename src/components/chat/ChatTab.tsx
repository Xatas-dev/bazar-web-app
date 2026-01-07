import { useCreateChat, useCreateMessage, useGetChatBySpace } from "@/hooks/useChat";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatTabProps {
  spaceId: number;
}

export function ChatTab({ spaceId }: ChatTabProps) {
  const { data: chat, isLoading: isLoadingChat } = useGetChatBySpace(spaceId);
  const createChatMutation = useCreateChat();
  const createMessageMutation = useCreateMessage();

  // Handle creating chat if it doesn't exist
  // Based on the spec, we might need to manually create it or it might be 404.
  // The error handling in axios interceptor might show a toast, but here we want to handle the 404 case gracefully if possible.
  // If `error` occurs, we can show a "Initialize Chat" button.

  const handleCreateChat = () => {
      createChatMutation.mutate({ spaceId });
  };

  const handleSendMessage = (content: string) => {
      if (chat?.id) {
          createMessageMutation.mutate({ chatId: chat.id, data: { content } });
      }
  };

  if (isLoadingChat) {
      return <div className="flex h-[400px] items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  // If no chat found (assuming API returns 404 or empty equivalent that results in error or undefined data)
  // Check if we have data or if we should show create button
  if (!chat) {
      return (
          <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
              <div className="bg-muted p-4 rounded-full">
                <MessageSquarePlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                  <h3 className="text-lg font-medium">No chat initialized</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                      Start a new conversation in this space.
                  </p>
              </div>
              <Button onClick={handleCreateChat} disabled={createChatMutation.isPending}>
                  {createChatMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Chat
              </Button>
          </div>
      );
  }

  return (
      <div className="flex flex-col h-[calc(100vh-250px)] min-h-[500px] border rounded-lg bg-background shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b px-4 py-3 bg-muted/30">
              <h3 className="font-medium flex items-center gap-2">
                  Space Chat
              </h3>
          </div>

          {/* Message List */}
          <MessageList chatId={chat.id} />

          {/* Input Area */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={createMessageMutation.isPending}
          />
      </div>
  );
}
