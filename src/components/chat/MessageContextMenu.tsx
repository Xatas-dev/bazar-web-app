import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageResponse } from "@/types/chat";
import { Trash2, Reply } from "lucide-react";

interface MessageContextMenuProps {
  message: MessageResponse;
  children: React.ReactNode;
  onDelete: (messageId: number) => void;
  onReply: (message: MessageResponse) => void;
}

export const MessageContextMenu = ({ message, children, onDelete, onReply }: MessageContextMenuProps) => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    onDelete(message.id);
    setOpen(false);
  };

  const handleReply = () => {
    onReply(message);
    setOpen(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent opening on left click
    e.stopPropagation();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <div
          onContextMenu={handleContextMenu}
          onClick={handleClick}
          onPointerDown={(e) => {
            // Prevent trigger from opening on any pointer down
            if (e.button !== 2) { // 2 is right mouse button
              e.preventDefault();
            }
          }}
        >
          {children}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={handleReply}
          className="cursor-pointer"
        >
          <Reply className="mr-2 h-4 w-4" />
          Ответить
        </DropdownMenuItem>
        {message.isDeletable && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
