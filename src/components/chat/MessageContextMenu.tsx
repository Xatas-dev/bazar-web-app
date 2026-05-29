import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ChatReactionResponse, MessageResponse, AllowedMessageAction } from "@/types/chat";
import { Trash2, Reply, Edit2, Users } from "lucide-react";

interface MessageContextMenuProps {
  message: MessageResponse;
  children: React.ReactNode;
  availableReactions?: ChatReactionResponse[];
  onDelete: (messageId: number) => void;
  onReply: (message: MessageResponse) => void;
  onEdit: (message: MessageResponse) => void;
  onReact?: (messageId: number, reactionId: string) => void;
  onOpenReactionUsers?: (message: MessageResponse) => void;
}

export const MessageContextMenu = ({
  message,
  children,
  availableReactions = [],
  onDelete,
  onReply,
  onEdit,
  onReact,
  onOpenReactionUsers,
}: MessageContextMenuProps) => {
  const canDelete = message.allowedActions?.includes(AllowedMessageAction.DELETE) ?? false;
  const canEdit = message.allowedActions?.includes(AllowedMessageAction.EDIT) ?? false;
  const userReactionCount = message.reactions?.filter((reaction) => reaction.reactedByMe).length ?? 0;

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

  const handleOpenReactionUsers = () => {
    if (onOpenReactionUsers) {
      onOpenReactionUsers(message);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
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
                const isBlockedByLimit = !isAlreadyReacted && userReactionCount >= 3;

                return (
                  <ContextMenuItem
                    key={reaction.reactionId}
                    disabled={isBlockedByLimit}
                    onSelect={() => handleReact(reaction.reactionId)}
                    className="h-9 w-9 justify-center rounded-md px-0 text-lg data-[disabled]:opacity-30"
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

        {onOpenReactionUsers && message.reactions && message.reactions.length > 0 && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={handleOpenReactionUsers} className="cursor-pointer text-muted-foreground focus:text-foreground">
              <Users className="mr-2 h-4 w-4" />
              Реакции
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
