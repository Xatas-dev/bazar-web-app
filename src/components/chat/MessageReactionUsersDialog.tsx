import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetMessageReactionUsers } from "@/hooks/useChat";
import { AuthorStatus, MessageResponse } from "@/types/chat";

interface MessageReactionUsersDialogProps {
  chatId: number;
  message: MessageResponse | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reactionLabelById: Record<string, string>;
}

const getDisplayName = (firstName: string | null, lastName: string | null, status: AuthorStatus) => {
  if (status === AuthorStatus.UNKNOWN) {
    return "Удаленный пользователь";
  }

  const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return fullName || "Удаленный пользователь";
};

const getInitials = (firstName: string | null, lastName: string | null, status: AuthorStatus) => {
  if (status === AuthorStatus.UNKNOWN) {
    return "УП";
  }

  const initials = `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();
  return initials || "УП";
};

export const MessageReactionUsersDialog = ({
  chatId,
  message,
  isOpen,
  onOpenChange,
  reactionLabelById,
}: MessageReactionUsersDialogProps) => {
  const messageId = message?.id;
  const { data, isLoading, isError } = useGetMessageReactionUsers(chatId, messageId, isOpen);

  const groupedReactions = data?.reactions ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Реакции</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Не удалось загрузить список реакций.
          </div>
        ) : groupedReactions.length === 0 ? (
          <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
            На этом сообщении пока нет реакций.
          </div>
        ) : (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            {groupedReactions.map((reactionGroup) => {
              const reactionLabel = reactionLabelById[reactionGroup.reactionId] ?? reactionGroup.reactionId;

              return (
                <div key={reactionGroup.reactionId} className="rounded-lg border p-3">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <span className="text-base leading-none">{reactionLabel}</span>
                    <span className="text-muted-foreground">{reactionGroup.users.length}</span>
                  </div>

                  <div className="space-y-2">
                    {reactionGroup.users.map((user) => {
                      const displayName = getDisplayName(user.firstName, user.lastName, user.status);
                      const initials = getInitials(user.firstName, user.lastName, user.status);

                      return (
                        <div key={user.userId} className="flex items-center gap-3 rounded-md px-1 py-1">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{displayName}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
