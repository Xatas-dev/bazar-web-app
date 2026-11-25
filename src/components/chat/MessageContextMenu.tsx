import { useRef, useState, type ComponentType, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLongPress } from "@/hooks/useLongPress";
import { ChatReactionResponse, MessageResponse, AllowedMessageAction } from "@/types/chat";
import { Trash2, Reply, Edit2, Users, ArrowLeft, Copy, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { COARSE_POINTER, useMediaQuery } from "@/hooks/useMediaQuery";
import { ReactionUsersList } from "./ReactionUsersList";

interface MessageContextMenuProps {
  spaceId: number;
  chatId: number;
  message: MessageResponse;
  children: ReactNode;
  availableReactions?: ChatReactionResponse[];
  reactionLabelById: Record<string, string>;
  onDelete: (messageId: number) => void;
  onReply: (message: MessageResponse) => void;
  onEdit: (message: MessageResponse) => void;
  onReact?: (messageId: number, reactionId: string) => void;
  /** Own messages sit on the right, so the menu aligns to the bubble's right edge */
  isOwn?: boolean;
}

/**
 * Pointer-ups this soon after opening belong to the gesture that opened the menu (right-click release,
 * long-press lift). Radix selects items on pointer-up, so they must be ignored or they hit a random item.
 */
const OPEN_GESTURE_GUARD_MS = 300;

/** Reactions shown in the collapsed desktop row; the rest sit behind the expand chevron */
const COLLAPSED_REACTION_COUNT = 5;

function MenuAction({
  icon: Icon,
  label,
  onSelect,
  destructive,
  large,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onSelect: (event: Event) => void;
  destructive?: boolean;
  large?: boolean;
}) {
  return (
    <DropdownMenuItem
      onSelect={onSelect}
      className={cn(
        "cursor-pointer gap-2",
        large && "h-11 gap-3 px-3 text-base",
        destructive && "text-destructive focus:text-destructive"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </DropdownMenuItem>
  );
}

/**
 * Message popup menu, the same on desktop (right-click) and phones (long-press).
 * Anchored to the bubble (below it, aligned to its side) so it always stays on screen: it shifts
 * sideways at the screen edge and flips above the bubble when there is no room below.
 * Two floating blocks of equal width: a reaction bar on top and the action menu below.
 * Phones: the reaction bar is one horizontally scrollable row.
 * Desktop: one row plus a chevron that expands the full reaction grid downwards.
 */
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
  isOwn = false,
}: MessageContextMenuProps) => {
  const isTouch = useMediaQuery(COARSE_POINTER);
  const [open, setOpen] = useState(false);
  const openedAtRef = useRef(0);
  const openMenu = () => {
    openedAtRef.current = performance.now();
    setOpen(true);
  };
  const longPress = useLongPress(openMenu, { enabled: isTouch });

  const swallowOpeningPointerUp = (event: ReactPointerEvent) => {
    if (performance.now() - openedAtRef.current < OPEN_GESTURE_GUARD_MS) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const [showReactionUsers, setShowReactionUsers] = useState(false);
  const [reactionsExpanded, setReactionsExpanded] = useState(false);
  const canDelete = message.allowedActions?.includes(AllowedMessageAction.DELETE) ?? false;
  const canEdit = message.allowedActions?.includes(AllowedMessageAction.EDIT) ?? false;
  const hasReactions = (message.reactions?.length ?? 0) > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setShowReactionUsers(false);
      setReactionsExpanded(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({ title: "Скопировано", description: "Текст сообщения в буфере обмена." });
    } catch {
      toast({ variant: "destructive", title: "Не удалось скопировать" });
    }
  };

  const canCollapse = !isTouch && availableReactions.length > COLLAPSED_REACTION_COUNT + 1;
  const visibleReactions =
    canCollapse && !reactionsExpanded ? availableReactions.slice(0, COLLAPSED_REACTION_COUNT) : availableReactions;

  const renderReaction = (reaction: ChatReactionResponse) => {
    const reacted =
      message.reactions?.some((r) => r.reactionId === reaction.reactionId && r.reactedByMe) ?? false;
    return (
      <DropdownMenuItem
        key={reaction.reactionId}
        onSelect={() => onReact?.(message.id, reaction.reactionId)}
        aria-label={`Реакция ${reaction.value}`}
        className={cn(
          "h-10 w-10 shrink-0 cursor-pointer justify-center rounded-full p-0 text-xl transition-transform hover:scale-110 active:scale-90",
          reacted && "bg-primary/15 ring-1 ring-inset ring-primary/40"
        )}
      >
        {reaction.value}
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <div
        className="relative w-fit max-w-full"
        // Right-click on desktop; Android also fires this on long-press
        onContextMenu={(event) => {
          event.preventDefault();
          openMenu();
        }}
        {...longPress}
      >
        {children}
        {/* Invisible anchor covering the bubble: the menu opens below it or flips above it, never over it.
            pointer-events-none, so clicks/selection on the bubble never open the menu */}
        <DropdownMenuTrigger asChild>
          <span aria-hidden tabIndex={-1} className="pointer-events-none absolute inset-0" />
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent
        bare
        side="bottom"
        align={isOwn ? "end" : "start"}
        sideOffset={6}
        collisionPadding={12}
        onPointerUpCapture={swallowOpeningPointerUp}
        // Don't return focus to the hidden anchor on close: focusing it scrolls the list back to this
        // message (undoing the jump to the bottom on "Ответить") and steals focus from the composer
        onCloseAutoFocus={(event) => event.preventDefault()}
        className="flex w-[17rem] max-w-[calc(100vw-1.5rem)] flex-col gap-2"
      >
        {/* Floating reaction bar (its own surface, same width as the menu) */}
        {availableReactions.length > 0 && !showReactionUsers ? (
          <div className="surface-panel-muted rounded-lg p-1" role="group" aria-label="Реакции">
            {isTouch ? (
              <div className="flex gap-1 overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {availableReactions.map(renderReaction)}
              </div>
            ) : (
              <div className={cn("flex flex-wrap gap-1", reactionsExpanded && "grid grid-cols-6")}>
                {visibleReactions.map(renderReaction)}
                {canCollapse ? (
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      setReactionsExpanded((value) => !value);
                    }}
                    aria-label={reactionsExpanded ? "Свернуть реакции" : "Все реакции"}
                    aria-expanded={reactionsExpanded}
                    className="ml-auto h-10 w-10 shrink-0 cursor-pointer justify-center rounded-full p-0 text-muted-foreground"
                  >
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform duration-200", reactionsExpanded && "rotate-180")}
                    />
                  </DropdownMenuItem>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {/* Action menu */}
        <div className="surface-panel-muted rounded-lg p-1">
          {showReactionUsers ? (
            <>
              <MenuAction
                icon={ArrowLeft}
                label="Назад"
                large={isTouch}
                onSelect={(event) => {
                  event.preventDefault();
                  setShowReactionUsers(false);
                }}
              />
              <DropdownMenuSeparator />
              <ReactionUsersList
                spaceId={spaceId}
                chatId={chatId}
                messageId={message.id}
                enabled={showReactionUsers}
                reactionLabelById={reactionLabelById}
                className="max-h-64 min-w-0"
              />
            </>
          ) : (
            <>
              <MenuAction icon={Reply} label="Ответить" large={isTouch} onSelect={() => onReply(message)} />
              <MenuAction icon={Copy} label="Копировать текст" large={isTouch} onSelect={handleCopy} />
              {canEdit ? (
                <MenuAction icon={Edit2} label="Редактировать" large={isTouch} onSelect={() => onEdit(message)} />
              ) : null}
              {hasReactions ? (
                <MenuAction
                  icon={Users}
                  label="Кто отреагировал"
                  large={isTouch}
                  onSelect={(event) => {
                    event.preventDefault();
                    setShowReactionUsers(true);
                  }}
                />
              ) : null}
              {canDelete ? (
                <>
                  <DropdownMenuSeparator />
                  <MenuAction
                    icon={Trash2}
                    label="Удалить"
                    destructive
                    large={isTouch}
                    onSelect={() => onDelete(message.id)}
                  />
                </>
              ) : null}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
