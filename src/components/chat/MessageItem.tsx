import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageResponse, ChatReactionResponse } from "@/types/chat";
import { motion } from "framer-motion";
import { MessageContextMenu } from "./MessageContextMenu";
import { MessageReactions } from "./MessageReactions";
import { Reply } from "lucide-react";

interface MessageItemProps {
  message: MessageResponse;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showAuthorName?: boolean;
  availableReactions?: ChatReactionResponse[];
  reactionLabelById: Record<string, string>;
  onDelete?: (messageId: number) => void;
  onReply?: (message: MessageResponse) => void;
  onEdit?: (message: MessageResponse) => void;
  onReact?: (messageId: number, reactionId: string) => void;
  onOpenReactionUsers?: (message: MessageResponse) => void;
}

export const MessageItem = ({
  message,
  isCurrentUser,
  showAvatar = true,
  showAuthorName = false,
  availableReactions = [],
  reactionLabelById,
  onDelete,
  onReply,
  onEdit,
  onReact,
  onOpenReactionUsers,
}: MessageItemProps) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const handleDelete = (messageId: number) => {
    if (onDelete) {
      onDelete(messageId);
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message);
    }
  };

  const handleReact = (messageId: number, reactionId: string) => {
    if (onReact) {
      onReact(messageId, reactionId);
    }
  };

  const getAuthorDisplayName = () => {
    if (!message.author) return "Unknown";
    const { firstName, lastName, userName } = message.author as any;
    if (firstName || lastName) return `${firstName || ""} ${lastName || ""}`.trim();
    return userName || "Unknown";
  };

  const getAuthorInitials = () => {
    if (!message.author) return "??";
    const { firstName, lastName, userName } = message.author as any;
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    return (userName || "??").substring(0, 2).toUpperCase();
  };

  const getReplyAuthorDisplayName = () => {
    if (!message.reply || !message.reply.author) return "Unknown";
    const { firstName, lastName, userName } = message.reply.author as any;
    if (firstName || lastName) return `${firstName || ""} ${lastName || ""}`.trim();
    return userName || "Unknown";
  };

  const showCornerCut = !isCurrentUser && showAvatar;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full items-end gap-2",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isCurrentUser && (
        <div className="flex w-8 flex-shrink-0 items-end">
          {showAvatar ? (
            <Avatar className="h-8 w-8 ring-1 ring-[hsl(var(--panel-border))]">
              <AvatarFallback>{getAuthorInitials()}</AvatarFallback>
            </Avatar>
          ) : <div className="w-8" />}
        </div>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[78%] sm:max-w-[72%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        <MessageContextMenu
          message={message}
          availableReactions={availableReactions}
          onDelete={handleDelete}
          onReply={handleReply}
          onEdit={handleEdit}
          onReact={handleReact}
          onOpenReactionUsers={onOpenReactionUsers}
        >
          <div className="w-fit max-w-full">
            <Card
              className={cn(
                "relative w-fit max-w-full overflow-hidden rounded-[22px] text-sm cursor-text select-text backdrop-blur-none",
                showCornerCut ? "rounded-bl-[8px]" : null,
                isCurrentUser
                  ? "!bg-[hsl(var(--self-block))] text-[hsl(var(--self-block-foreground))]"
                  : "!bg-[hsl(var(--card))] text-foreground"
              )}
            >
              <CardContent className="relative z-10 px-3.5 py-2.5">
                {!isCurrentUser && showAuthorName ? (
                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                    {getAuthorDisplayName()}
                  </div>
                ) : null}
                {message.reply && (
                  <div
                    className={cn(
                      "mb-2 rounded-[18px] pl-3 pr-2 py-2 text-xs backdrop-blur-none",
                      isCurrentUser
                        ? "border-[hsl(var(--self-block-foreground)/0.6)] bg-[hsl(var(--self-block-foreground)/0.1)]"
                        : "border-[hsl(var(--panel-border))] bg-muted"
                    )}
                  >
                    <div className="mb-0.5 flex items-center gap-1">
                      <Reply className="h-3 w-3" />
                      <span className="font-medium">{getReplyAuthorDisplayName()}</span>
                    </div>
                    <p className="truncate">{message.reply.contentPreview}</p>
                  </div>
                )}

                <div className="flex items-end justify-between gap-2">
                  <p className="whitespace-pre-wrap break-words leading-5 min-w-0">
                    {message.content}
                  </p>
                  <span className={cn(
                    "shrink-0 text-[10px] font-medium translate-y-0.5 select-none",
                    isCurrentUser ? "text-[hsl(var(--self-block-foreground)/0.8)]" : "text-muted-foreground/80"
                  )}>
                    {formattedTime}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </MessageContextMenu>

        <MessageReactions
          message={message}
          reactionLabelById={reactionLabelById}
          onReact={handleReact}
        />
      </div>
    </motion.div>
  );
};
