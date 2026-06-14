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
    const {data: chat, isLoading: isLoadingChat} = useGetChatBySpace(spaceId);
    const createChatMutation = useCreateChat();
    const createMessageMutation = useCreateMessage();
    const editMessageMutation = useEditMessage();
    const [replyToMessage, setReplyToMessage] = useState<MessageResponse | null>(null);
    const [editingMessage, setEditingMessage] = useState<MessageResponse | null>(null);

    const handleCreateChat = () => {
        if (!canWrite) {
            notify.error.forbidden();
            return;
        }
        createChatMutation.mutate({spaceId});
    };

    const handleSendMessage = (content: string, replyMessageId?: number) => {
        if (chat?.id) {
            createMessageMutation.mutate({chatId: chat.id, data: {content, replyMessageId}});
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
                {chatId: chat.id, messageId, data: {newContent}},
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

    if (!chat) {
        return (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 text-center">
                <div
                    className="surface-panel-muted p-4 rounded-full">
                    <MessageSquarePlus className="h-8 w-8 text-muted-foreground"/>
                </div>
                <div>
                    <h3 className="text-lg font-medium">No chat initialized</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Start a new conversation in this space.
                    </p>
                </div>
                <Button onClick={handleCreateChat} disabled={createChatMutation.isPending}>
                    Create Chat
                </Button>
            </div>
        );
    }

    return (
        <div className="relative flex h-full min-h-0 flex-col bg-transparent">
            {/* Message List */}
            <MessageList chatId={chat.id} onReply={handleReply} onEdit={handleEditMessage}/>

            {/* Input Area */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30">
                <div className="mx-auto w-full max-w-4xl px-3 sm:px-6">
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
