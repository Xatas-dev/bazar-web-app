import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, X, Reply } from "lucide-react";
import { MessageResponse, AuthorStatus } from "@/types/chat";

interface ChatInputProps {
  onSendMessage: (content: string, replyMessageId?: number) => void;
  isLoading: boolean;
  replyToMessage?: MessageResponse | null;
  onCancelReply?: () => void;
}

export const ChatInput = ({ onSendMessage, isLoading, replyToMessage, onCancelReply }: ChatInputProps) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (content.trim() && !isLoading) {
      onSendMessage(content, replyToMessage?.id);
      setContent("");
      // Reset height
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
      }
      // Clear reply after sending
      if (onCancelReply) {
        onCancelReply();
      }
    }
  };

  const getAuthorDisplayName = (message: MessageResponse) => {
    if (message.author.status === AuthorStatus.UNKNOWN) {
      return "Неизвестный пользователь";
    }

    const firstName = message.author.firstName || '';
    const lastName = message.author.lastName || '';
    return `${firstName} ${lastName}`.trim() || "Неизвестный пользователь";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
  }, [content]);

  return (
    <div className="border-t bg-background">
      {replyToMessage && (
        <div className="px-4 pt-3 pb-2 bg-muted/30 border-b">
          <div className="flex items-start justify-between gap-2 max-w-4xl mx-auto">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Reply className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium text-muted-foreground">
                  Ответ на сообщение от {getAuthorDisplayName(replyToMessage)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {replyToMessage.content.substring(0, 30)}
                {replyToMessage.content.length > 30 ? '...' : ''}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={onCancelReply}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[2.5rem] max-h-32 resize-none"
            rows={1}
          />
          <Button
              size="icon"
              onClick={handleSend}
              disabled={!content.trim() || isLoading}
              className="mb-0.5 shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
