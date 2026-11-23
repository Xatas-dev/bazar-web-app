import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageResponse, ChatReactionResponse } from "@/types/chat";
import { motion } from "framer-motion";
import { MessageContextMenu } from "./MessageContextMenu";
import { MessageReactions } from "./MessageReactions";
import { Reply } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar";
import { getInitialsFromDisplayName } from "@/lib/user-display";
import { useState } from "react";
import { COARSE_POINTER, useMediaQuery } from "@/hooks/useMediaQuery";

/** Swipe distance (px, leftwards) that triggers "reply" on touch devices */
const SWIPE_REPLY_THRESHOLD = 56;

interface MessageItemProps {
  spaceId: number;
  chatId: number;
  message: MessageResponse;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showAuthorName?: boolean;
  /** Fade in on mount — only for messages that arrive while the chat is open */
  animateIn?: boolean;
  availableReactions?: ChatReactionResponse[];
  reactionLabelById: Record<string, string>;
  onDelete?: (messageId: number) => void;
  onReply?: (message: MessageResponse) => void;
  onEdit?: (message: MessageResponse) => void;
  onReact?: (messageId: number, reactionId: string) => void;
}

export const MessageItem = ({
  spaceId,
  chatId,
  message,
  isCurrentUser,
  showAvatar = true,
  showAuthorName = false,
  animateIn = false,
  availableReactions = [],
  reactionLabelById,
  onDelete,
  onReply,
  onEdit,
  onReact,
}: MessageItemProps) => {
  const isTouch = useMediaQuery(COARSE_POINTER);
  const [swipeReady, setSwipeReady] = useState(false);

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

  const authorDisplayName = message.author?.displayName || "Неизвестный пользователь";
  const authorInitials = getInitialsFromDisplayName(authorDisplayName);

  const replyAuthorDisplayName = message.reply?.author?.displayName || "Неизвестный пользователь";

  return (
    <div className="relative">
    {isTouch ? (
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-150",
          swipeReady ? "scale-100 opacity-100" : "scale-50 opacity-0"
        )}
      >
        <Reply className="h-4 w-4" />
      </div>
    ) : null}
    <motion.div
      initial={animateIn ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "tween", duration: 0.18, ease: "easeOut" }}
      // Touch: swipe the message left to reply (vertical scrolling stays native)
      drag={isTouch ? "x" : false}
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.45, right: 0 }}
      dragSnapToOrigin
      onDrag={(_, info) => setSwipeReady(info.offset.x <= -SWIPE_REPLY_THRESHOLD)}
      onDragEnd={(_, info) => {
        setSwipeReady(false);
        if (info.offset.x <= -SWIPE_REPLY_THRESHOLD) {
          navigator.vibrate?.(10);
          handleReply();
        }
      }}
      className={cn(
        "relative flex w-full items-end gap-2",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isCurrentUser && (
        <div className="flex w-8 flex-shrink-0 items-end">
          {showAvatar ? (
            <Avatar className="h-8 w-8 ring-1 ring-[hsl(var(--panel-border))]">
              {message.author?.avatarUrl ? (
                <AvatarImage src={message.author.avatarUrl} alt={authorDisplayName} className="object-cover" />
              ) : null}
              <AvatarFallback>{authorInitials}</AvatarFallback>
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
          spaceId={spaceId}
          chatId={chatId}
          message={message}
          availableReactions={availableReactions}
          reactionLabelById={reactionLabelById}
          onDelete={handleDelete}
          onReply={handleReply}
          onEdit={handleEdit}
          onReact={handleReact}
          isOwn={isCurrentUser}
        >
          <div
            className={cn(
              "w-fit max-w-full",
              // Touch: long-press opens the menu, so suppress the native text-selection callout
              isTouch && "select-none [-webkit-touch-callout:none]"
            )}
          >
            <Card
              className={cn(
                "relative w-fit max-w-full overflow-hidden rounded-lg text-sm backdrop-blur-none",
                isTouch ? "select-none" : "cursor-text select-text",
                showAvatar ? (!isCurrentUser ? "rounded-bl-none" : "rounded-br-none") : null,
                isCurrentUser
                  ? "!bg-[hsl(var(--self-block))] text-[hsl(var(--self-block-foreground))]"
                  : "!bg-[hsl(var(--card))] text-foreground"
              )}
            >
              <CardContent className="relative z-10 px-3.5 py-2.5">
                {!isCurrentUser && showAuthorName ? (
                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                    {authorDisplayName}
                  </div>
                ) : null}
                {message.reply && (
                  <div
                    className={cn(
                      "mb-2 rounded-lg pl-3 pr-2 py-2 text-xs backdrop-blur-none",
                      isCurrentUser
                        ? "border-[hsl(var(--self-block-foreground)/0.6)] bg-[hsl(var(--self-block-foreground)/0.1)]"
                        : "border-[hsl(var(--panel-border))] bg-muted"
                    )}
                  >
                    <div className="mb-0.5 flex items-center gap-1">
                      <Reply className="h-3 w-3" />
                      <span className="font-medium">{replyAuthorDisplayName}</span>
                    </div>
                    <p className="truncate">
                        {message.reply.contentPreview}
                        {message.reply.contentPreview.length >= 30 ? '...' : ''}
                    </p>
                  </div>
                )}

                <div className="flex items-end justify-between gap-2">
                  <p className="whitespace-pre-wrap break-words leading-5 min-w-0">
                    {message.content}
                  </p>
                  <span className={cn(
                    "shrink-0 text-xs font-medium translate-y-0.5 select-none",
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
    </div>
  );
};
