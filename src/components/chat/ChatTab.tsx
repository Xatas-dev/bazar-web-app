import {isAxiosError} from "axios";
import {useCreateChat, useGetChatBySpace} from "@/hooks/useChat";
import {useCreateMessage, useEditMessage} from "@/hooks/useChatMessages";
import {MessageList} from "./MessageList";
import {ChatInput} from "./ChatInput";
import {MessageSquarePlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ChatTabSkeleton} from "./ChatTabSkeleton";
import {useState} from "react";
import {MessageResponse} from "@/types/chat";
import { notify } from "@/lib/notifications";

interface ChatTabProps {
    spaceId: number;
    canWrite?: boolean;
}

export function ChatTab({spaceId, canWrite = true}: ChatTabProps) {
    const {data: chat, isLoading: isLoadingChat, isError, error} = useGetChatBySpace(spaceId);
    const createChatMutation = useCreateChat();
    const createMessageMutation = useCreateMessage();
    const editMessageMutation = useEditMessage();
    const [replyToMessage, setReplyToMessage] = useState<MessageResponse | null>(null);
    const [editingMessage, setEditingMessage] = useState<MessageResponse | null>(null);
    const [scrollToBottomKey, setScrollToBottomKey] = useState(0);

    const handleCreateChat = () => {
        if (!canWrite) {
            notify.error.forbidden();
            return;
        }
        createChatMutation.mutate({spaceId});
    };

    const handleSendMessage = (content: string, replyMessageId?: number) => {
        if (chat?.id) {
            createMessageMutation.mutate({spaceId, chatId: chat.id, data: {content, replyMessageId}});
            // Replying from the middle of the history must still show the sent message
            setScrollToBottomKey((key) => key + 1);
        }
    };

    const handleReply = (message: MessageResponse) => {
        setReplyToMessage(message);
        // Starting a reply takes the user down to the composer and the latest messages
        setScrollToBottomKey((key) => key + 1);
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
                {spaceId, chatId: chat.id, messageId, data: {newContent}},
                {
                    onSuccess: () => {
                        setEditingMessage(null);
                    },
                }
            );
        }
    };

    if (isLoadingChat) {
        return <ChatTabSkeleton />;
    }

    if (isError) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status !== 404) {
            return (
                <div className="rounded-lg border border-destructive bg-[hsl(var(--panel-surface-muted))] p-6 text-destructive">
                    <h3 className="text-lg font-semibold">Ошибка загрузки чата</h3>
                    <p className="text-sm text-muted-foreground">
                        Не удалось загрузить чат. Пожалуйста, попробуйте позже.
                    </p>
                </div>
            );
        }
    }

    if (!chat) {
        return (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
                <div
                    className="surface-panel-muted p-4 rounded-full">
                    <MessageSquarePlus className="h-8 w-8 text-muted-foreground"/>
                </div>
                <div>
                    <h3 className="text-lg font-medium">Чат не найден</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Начните новый разговор в этом спейса.
                    </p>
                </div>
                <Button onClick={handleCreateChat} disabled={createChatMutation.isPending}>
                    Создать чат
                </Button>
            </div>
        );
    }

    return (
        <div className="relative flex h-full min-h-0 flex-col bg-transparent">
            <MessageList
                spaceId={spaceId}
                chatId={chat.id}
                onReply={handleReply}
                onEdit={handleEditMessage}
                hasComposerBanner={!!replyToMessage || !!editingMessage}
                scrollToBottomKey={scrollToBottomKey}
            />

            {/* Composer floats over the list (frosted); clears the home indicator on phones */}
            <div className="pointer-events-none absolute inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 md:bottom-6">
                <div className="mx-auto w-full max-w-4xl px-3 md:px-6">
                    <ChatInput
                        className="pointer-events-auto w-full"
                        onSendMessage={handleSendMessage}
                        onEditMessage={handleEditMessageSubmit}
                        isLoading={createMessageMutation.isPending || editMessageMutation.isPending}
                        replyToMessage={replyToMessage}
                        editingMessage={editingMessage}
                        onCancelReply={handleCancelReply}
                        onCancelEdit={handleCancelEdit}
                        readOnly={!canWrite}
                    />
                </div>
            </div>
        </div>
    );
}
