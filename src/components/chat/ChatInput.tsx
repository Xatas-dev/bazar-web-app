import {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Edit2, Reply, SendHorizontal, X} from "lucide-react";
import {AuthorStatus, MessageResponse} from "@/types/chat";
import {cn} from "@/lib/utils";

interface ChatInputProps {
    onSendMessage: (content: string, replyMessageId?: number) => void;
    onEditMessage?: (messageId: number, newContent: string) => void;
    isLoading: boolean;
    replyToMessage?: MessageResponse | null;
    editingMessage?: MessageResponse | null;
    onCancelReply?: () => void;
    onCancelEdit?: () => void;
    readOnly?: boolean;
    className?: string;
}

export const ChatInput = ({
                              onSendMessage,
                              onEditMessage,
                              isLoading,
                              replyToMessage,
                              editingMessage,
                              onCancelReply,
                              onCancelEdit,
                              readOnly = false,
                              className,
                          }: ChatInputProps) => {
    const [content, setContent] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Update content when switching between edit and reply
    useEffect(() => {
        if (editingMessage) {
            setContent(editingMessage.content);
        } else if (replyToMessage) {
            setContent("");
        }
    }, [editingMessage, replyToMessage]);

    const handleSend = () => {
        if (content.trim() && !isLoading && !readOnly) {
            if (editingMessage && onEditMessage) {
                // Edit existing message
                onEditMessage(editingMessage.id, content);
            } else {
                // Send new message
                onSendMessage(content, replyToMessage?.id);
            }
            setContent("");
            // Reset height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
            // Clear reply/edit after sending
            if (editingMessage && onCancelEdit) {
                onCancelEdit();
            } else if (onCancelReply) {
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
        if (readOnly) {
            return;
        }
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
        <div
            className={cn(
                "relative overflow-hidden rounded-[24px]",
                "surface-panel-muted",
                "ring-1 ring-[hsl(var(--panel-border))]",
                className
            )}
        >
            {/* Edit banner */}
            {editingMessage && (
                <div className="px-3 pt-2 pb-1.5 border-b border-[hsl(var(--panel-border))] animate-in fade-in-0 slide-in-from-top-1 duration-150">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Edit2 className="h-3 w-3 text-muted-foreground shrink-0"/>
                                <span className="text-xs font-medium text-muted-foreground">
                Редактирование сообщения
              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                                {editingMessage.content.substring(0, 30)}
                                {editingMessage.content.length > 30 ? '...' : ''}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={onCancelEdit}
                        >
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            )}

            {/* Reply banner */}
            {replyToMessage && !editingMessage && (
                <div className="px-3 pt-2 pb-1.5 border-b border-[hsl(var(--panel-border))] animate-in fade-in-0 slide-in-from-top-1 duration-150">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Reply className="h-3 w-3 text-muted-foreground shrink-0"/>
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
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            )}

            {/* Input row */}
            <div className="flex items-end gap-2 px-2 py-2">
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="
          min-h-[2rem] max-h-24 resize-none
          !border-0 !bg-transparent !shadow-none !ring-0
          backdrop-blur-none
          !outline-none
          focus-visible:!ring-0 focus-visible:!ring-offset-0
          px-3 py-1.5
          rounded-none
        "
                    rows={1}
                    readOnly={readOnly}
                    title={readOnly ? "У вас нет прав на отправку сообщений в этом пространстве" : undefined}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSend}
                    disabled={readOnly || !content.trim() || isLoading}
                    className="
          h-9 w-9 shrink-0 rounded-full
          !bg-[hsl(var(--panel-surface-strong))]
          !text-foreground
          hover:!bg-[hsl(var(--panel-surface-strong))]
          hover:!text-foreground
          surface-panel-strong
          ring-1 ring-[hsl(var(--panel-border))]
          mb-0.5
        "
                >
                    <SendHorizontal className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
}
