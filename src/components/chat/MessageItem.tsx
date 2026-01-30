import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MessageResponse } from "@/types/chat";
import { UserDtoResponse } from "@/types/api";
import { motion } from "framer-motion";
import { MessageContextMenu } from "./MessageContextMenu";

interface MessageItemProps {
  message: MessageResponse;
  isCurrentUser: boolean;
  user?: UserDtoResponse;
  showAvatar?: boolean;
  onDelete?: (messageId: number) => void;
}

export const MessageItem = ({ message, isCurrentUser, user, showAvatar = true, onDelete }: MessageItemProps) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleDelete = (messageId: number) => {
    if (onDelete) {
      onDelete(messageId);
    }
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
                    <AvatarImage src={user?.userPic || undefined} alt={user?.userName || "User"} />
                    <AvatarFallback>{user?.userName?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
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
                 {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.userName || 'Unknown'}
             </span>
         )}

        <MessageContextMenu message={message} onDelete={handleDelete}>
          <div
            className={cn(
              "rounded-lg px-4 py-2 text-sm cursor-pointer",
              isCurrentUser
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-muted text-foreground rounded-tl-none"
            )}
          >
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
