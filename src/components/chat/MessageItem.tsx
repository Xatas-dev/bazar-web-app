import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MessageResponse, AuthorStatus } from "@/types/chat";
import { motion } from "framer-motion";
import { MessageContextMenu } from "./MessageContextMenu";
import { Reply } from "lucide-react";

interface MessageItemProps {
  message: MessageResponse;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  onDelete?: (messageId: number) => void;
  onReply?: (message: MessageResponse) => void;
  onEdit?: (message: MessageResponse) => void;
}

export const MessageItem = ({ message, isCurrentUser, showAvatar = true, onDelete, onReply, onEdit }: MessageItemProps) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleDelete = (messageId: number) => {
    if (onDelete) {
      onDelete(messageId);
    }
  };

  const handleReply = (message: MessageResponse) => {
    if (onReply) {
      onReply(message);
    }
  };

  const handleEdit = (message: MessageResponse) => {
    if (onEdit) {
      onEdit(message);
    }
  };

  // Determine display name based on author status
  const getAuthorDisplayName = () => {
    if (message.author.status === AuthorStatus.UNKNOWN) {
      return "Неизвестный пользователь";
    }

    const firstName = message.author.firstName || '';
    const lastName = message.author.lastName || '';
    return `${firstName} ${lastName}`.trim() || "Неизвестный пользователь";
  };

  // Get initials for avatar fallback
  const getAuthorInitials = () => {
    if (message.author.status === AuthorStatus.UNKNOWN) {
      return "??";
    }

    const firstName = message.author.firstName || '';
    const lastName = message.author.lastName || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return initials || "??";
  };

  // Get display name for reply author
  const getReplyAuthorDisplayName = () => {
    if (!message.reply) return "";

    if (message.reply.author.status === AuthorStatus.UNKNOWN) {
      return "Неизвестный пользователь";
    }

    const firstName = message.reply.author.firstName || '';
    const lastName = message.reply.author.lastName || '';
    return `${firstName} ${lastName}`.trim() || "Неизвестный пользователь";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-2 mb-4",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar (only for others) */}
      {!isCurrentUser && (
         <div className="flex-shrink-0 w-8">
            {showAvatar ? (
                 <Avatar className="h-8 w-8">
                    <AvatarFallback>{getAuthorInitials()}</AvatarFallback>
                </Avatar>
            ) : <div className="w-8" />}
         </div>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
         {!isCurrentUser && showAvatar && (
             <span className="text-xs text-muted-foreground mb-1 ml-1">
                 {getAuthorDisplayName()}
             </span>
         )}

        <MessageContextMenu message={message} onDelete={handleDelete} onReply={handleReply} onEdit={handleEdit}>
          <div
            className={cn(
              "rounded-lg px-4 py-2 text-sm cursor-text select-text",
              isCurrentUser
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-muted text-foreground rounded-tl-none"
            )}
          >
            {message.reply && (
              <div className={cn(
                "mb-2 pb-2 border-l-2 pl-2 text-xs opacity-80",
                isCurrentUser
                  ? "border-primary-foreground/30"
                  : "border-muted-foreground/30"
              )}>
                <div className="flex items-center gap-1 mb-0.5">
                  <Reply className="h-3 w-3" />
                  <span className="font-medium">{getReplyAuthorDisplayName()}</span>
                </div>
                <p className="truncate">{message.reply.contentPreview}</p>
              </div>
            )}
            {message.content}
          </div>
        </MessageContextMenu>
        <span className="text-[10px] text-muted-foreground mt-1 px-1">
            {formattedTime}
        </span>
      </div>
    </motion.div>
  );
}
