import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatReactionResponse, MessageResponse, AllowedMessageAction } from "@/types/chat";
import { Trash2, Reply, Edit2, Users, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMessageReactionUsers } from "@/hooks/useChatReactions";
import { getDisplayName, getInitials } from "@/lib/user-display";

interface MessageContextMenuProps {
  spaceId: number;
  chatId: number;
  message: MessageResponse;
  children: React.ReactNode;
  availableReactions?: ChatReactionResponse[];
  reactionLabelById: Record<string, string>;
  onDelete: (messageId: number) => void;
  onReply: (message: MessageResponse) => void;
  onEdit: (message: MessageResponse) => void;
  onReact?: (messageId: number, reactionId: string) => void;
}

export const MessageContextMenu = ({
  spaceId,
  chatId,
  message,
  children,
  availableReactions = [],
  reactionLabelById,
  onDelete,
  onReply,
  onEdit,
  onReact,
}: MessageContextMenuProps) => {
  const [showReactionUsers, setShowReactionUsers] = useState(false);
  const canDelete = message.allowedActions?.includes(AllowedMessageAction.DELETE) ?? false;
  const canEdit = message.allowedActions?.includes(AllowedMessageAction.EDIT) ?? false;
  const hasReactions = message.reactions && message.reactions.length > 0;

  const { data: reactionUsersData, isLoading: isReactionUsersLoading } = useGetMessageReactionUsers(
    spaceId,
    chatId,
    message.id,
    showReactionUsers
  );

  const handleDelete = () => {
    onDelete(message.id);
  };

  const handleReply = () => {
    onReply(message);
  };

  const handleEdit = () => {
    onEdit(message);
  };

  const handleReact = (reactionId: string) => {
    if (onReact) {
      onReact(message.id, reactionId);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {showReactionUsers ? (
          <>
            <ContextMenuItem
              onSelect={(e) => { e.preventDefault(); setShowReactionUsers(false); }}
              className="cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </ContextMenuItem>
            <ContextMenuSeparator />
            {isReactionUsersLoading ? (
              <div className="flex items-center justify-center py-6 min-w-60">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : reactionUsersData && reactionUsersData.reactions.length > 0 ? (
              <div className="max-h-64 overflow-y-auto px-1 min-w-60">
                {reactionUsersData.reactions.map((group) => {
                  const reactionLabel = reactionLabelById[group.reactionId] ?? group.reactionId;
                  return (
                    <div key={group.reactionId} className="mb-1">
                      <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                        <span className="text-sm leading-none">{reactionLabel}</span>
                        <span>{group.users.length}</span>
                      </div>
                      {group.users.map((user) => (
                        <div key={user.userId} className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(user.firstName, user.lastName, "УП")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{getDisplayName(user.firstName, user.lastName, "Удаленный пользователь")}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground min-w-60">
                Нет реакций
              </div>
            )}
          </>
        ) : (
          <>
            {availableReactions.length > 0 && (
              <>
                <div className="px-2 pb-1 pt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Реакции
                </div>
                <div className="grid grid-cols-6 gap-1 px-1 pb-1">
                  {availableReactions.map((reaction) => {
                    const isAlreadyReacted = message.reactions?.some(
                      (messageReaction) => messageReaction.reactionId === reaction.reactionId && messageReaction.reactedByMe
                    ) ?? false;

                    return (
                      <ContextMenuItem
                        key={reaction.reactionId}
                        onSelect={() => handleReact(reaction.reactionId)}
                        className={cn(
                          "h-9 w-9 justify-center rounded-md px-0 text-lg transition-transform hover:scale-110 active:scale-75 data-[disabled]:opacity-30",
                          isAlreadyReacted && "animate-reaction-blink bg-primary/10"
                        )}
                      >
                        {reaction.value}
                      </ContextMenuItem>
                    );
                  })}
                </div>
                <ContextMenuSeparator />
              </>
            )}

            <ContextMenuItem onSelect={handleReply} className="cursor-pointer">
              <Reply className="mr-2 h-4 w-4" />
              Ответить
            </ContextMenuItem>

            {canEdit && (
              <ContextMenuItem onSelect={handleEdit} className="cursor-pointer">
                <Edit2 className="mr-2 h-4 w-4" />
                Редактировать
              </ContextMenuItem>
            )}
            {canDelete && (
              <ContextMenuItem onSelect={handleDelete} className="text-destructive focus:text-destructive cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </ContextMenuItem>
            )}

            {hasReactions && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onSelect={(e) => { e.preventDefault(); setShowReactionUsers(true); }}
                  className="cursor-pointer"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Реакции
                </ContextMenuItem>
              </>
            )}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
