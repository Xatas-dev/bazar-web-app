import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageResponse } from "@/types/chat";
import { Trash2 } from "lucide-react";

interface MessageContextMenuProps {
  message: MessageResponse;
  children: React.ReactNode;
  onDelete: (messageId: number) => void;
}

export const MessageContextMenu = ({ message, children, onDelete }: MessageContextMenuProps) => {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    onDelete(message.id);
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

  // Don't show context menu if isDeletable is false or undefined
  if (!message.isDeletable) {
    return <>{children}</>;
  }

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
          onClick={handleDelete}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
