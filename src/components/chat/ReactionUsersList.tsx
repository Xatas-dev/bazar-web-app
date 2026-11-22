import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetMessageReactionUsers } from "@/hooks/useChatReactions";
import { getDisplayName, getInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

interface ReactionUsersListProps {
  spaceId: number;
  chatId: number;
  messageId: number;
  enabled: boolean;
  reactionLabelById: Record<string, string>;
  className?: string;
}

/** Who reacted with what. Shared by the desktop context menu and the mobile action sheet. */
export function ReactionUsersList({
  spaceId,
  chatId,
  messageId,
  enabled,
  reactionLabelById,
  className,
}: ReactionUsersListProps) {
  const { data, isLoading } = useGetMessageReactionUsers(spaceId, chatId, messageId, enabled);

  if (isLoading) {
    return (
      <div className={cn("flex min-w-60 items-center justify-center py-6", className)}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!data || data.reactions.length === 0) {
    return <div className={cn("min-w-60 px-2 py-4 text-center text-sm text-muted-foreground", className)}>Нет реакций</div>;
  }

  return (
    <div className={cn("min-w-60 overflow-y-auto px-1", className)}>
      {data.reactions.map((group) => {
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
                  <AvatarFallback className="text-xs">{getInitials(user.firstName, user.lastName, "УП")}</AvatarFallback>
                </Avatar>
                <span className="truncate">{getDisplayName(user.firstName, user.lastName, "Удаленный пользователь")}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
