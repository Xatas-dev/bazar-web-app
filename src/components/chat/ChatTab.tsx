import { useCreateChat, useCreateMessage, useGetChatBySpace, useEditMessage } from "@/hooks/useChat";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MessageResponse } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface ChatTabProps {
  spaceId: number;
}

export function ChatTab({ spaceId }: ChatTabProps) {
  const { data: chat, isLoading: isLoadingChat } = useGetChatBySpace(spaceId);
  const createChatMutation = useCreateChat();
  const createMessageMutation = useCreateMessage();
  const editMessageMutation = useEditMessage();
  const { toast } = useToast();
  const [replyToMessage, setReplyToMessage] = useState<MessageResponse | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageResponse | null>(null);

  const handleCreateChat = () => {
      createChatMutation.mutate({ spaceId });
  };

  const handleSendMessage = (content: string, replyMessageId?: number) => {
      if (chat?.id) {
          createMessageMutation.mutate({ chatId: chat.id, data: { content, replyMessageId } });
      }
  };

  const handleReply = (message: MessageResponse) => {
      setReplyToMessage(message);
  };

  const handleCancelReply = () => {
      setReplyToMessage(null);
  };

  const handleEditMessage = (message: MessageResponse) => {
      setEditingMessage(message);
  };

  const handleCancelEdit = () => {
      setEditingMessage(null);
  };

  const handleEditMessageSubmit = (messageId: number, newContent: string) => {
      if (chat?.id) {
          editMessageMutation.mutate(
              { chatId: chat.id, messageId, data: { newContent } },
              {
                  onSuccess: () => {
                      toast({
                          title: "Сообщение отредактировано",
                          description: "Сообщение успешно обновлено",
                      });
                      setEditingMessage(null);
                  },
                  onError: () => {
                      toast({
                          variant: "destructive",
                          title: "Ошибка",
                          description: "Не удалось отредактировать сообщение",
                      });
                  },
              }
          );
      }
  };

  if (isLoadingChat) {
      return <div className="flex h-[400px] items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

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
          <MessageList chatId={chat.id} onReply={handleReply} onEdit={handleEditMessage} />

          {/* Input Area */}
          <ChatInput
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessageSubmit}
            isLoading={createMessageMutation.isPending || editMessageMutation.isPending}
            replyToMessage={replyToMessage}
            editingMessage={editingMessage}
            onCancelReply={handleCancelReply}
            onCancelEdit={handleCancelEdit}
          />
      </div>
  );
}
