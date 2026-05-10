import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { MessageResponse, AllowedMessageAction } from "@/types/chat";
import { Trash2, Reply, Edit2 } from "lucide-react";

interface MessageContextMenuProps {
  message: MessageResponse;
  children: React.ReactNode;
  onDelete: (messageId: number) => void;
  onReply: (message: MessageResponse) => void;
  onEdit: (message: MessageResponse) => void;
}

export const MessageContextMenu = ({ message, children, onDelete, onReply, onEdit }: MessageContextMenuProps) => {
  const canDelete = message.allowedActions?.includes(AllowedMessageAction.DELETE) ?? false;
  const canEdit = message.allowedActions?.includes(AllowedMessageAction.EDIT) ?? false;

  const handleDelete = () => {
    onDelete(message.id);
  };

  const handleReply = () => {
    onReply(message);
  };

  const handleEdit = () => {
    onEdit(message);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleReply} className="cursor-pointer">
          <Reply className="mr-2 h-4 w-4" />
          Ответить
        </ContextMenuItem>
        {canEdit && (
          <ContextMenuItem onClick={handleEdit} className="cursor-pointer">
            <Edit2 className="mr-2 h-4 w-4" />
            Редактировать
          </ContextMenuItem>
        )}
        {canDelete && (
          <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
