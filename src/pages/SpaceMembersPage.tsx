import { useParams } from "react-router-dom";
import { useSpaceUsers, useDeleteUserFromSpace } from "@/hooks/useSpaces";
import { useGetRoles, useAssignRoleToUser } from "@/hooks/useRoles";
import { Trash2, Shield, Loader2, ArrowLeft, Crown } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MembersListSkeleton } from "@/components/members/MembersListSkeleton";
import { AddMemberSearch } from "@/components/members/AddMemberSearch";
import { confirmDialog } from "@/lib/dialogs";
import { notify } from "@/lib/notifications";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SpaceMembersPage({ canAssign, canAdd, canDelete }: { canAssign?: boolean; canAdd?: boolean; canDelete?: boolean }) {
  const { spaceId } = useParams();
  const id = Number(spaceId);
  const { data: spaceUsersResponse, isLoading: isLoadingMembers } = useSpaceUsers(id);
  const users = spaceUsersResponse?.users || [];

  const removeUserMutation = useDeleteUserFromSpace();

  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [roleMenuUserId, setRoleMenuUserId] = useState<string | null>(null);
  // Radix opens the dropdown on pointerdown, i.e. as soon as a finger touches the list, so every
  // scroll gesture opened the menu. For touch/pen we open on click instead: the browser doesn't
  // fire click when the gesture turns into a scroll.
  const lastPointerTypeRef = useRef<string>("mouse");
  const { data: rolesResponse, isLoading: isLoadingRoles } = useGetRoles(id, roleMenuUserId !== null);
  const assignRoleMutation = useAssignRoleToUser();
  const roles = rolesResponse?.roles || [];

  // Search results show "В спейсе" for these
  const memberUserIds = useMemo(
    () => new Set((spaceUsersResponse?.users ?? []).map((u) => u.userId)),
    [spaceUsersResponse]
  );

  const handleRemoveUser = async (userId: string) => {
    if (!canDelete) {
        notify.error.forbidden();
        return;
    }
    const confirmed = await confirmDialog({
        title: "Удалить участника?",
        description: "Пользователь потеряет доступ к чату и файлам этого спейса.",
        confirmLabel: "Удалить",
        destructive: true,
    });
    if (confirmed) {
        removeUserMutation.mutate({ spaceId: id, userId });
    }
  };

  const handleAssignRole = (userId: string, roleId: number, _roleName: string, _userName: string | null) => {
    void _roleName;
    void _userName;
    assignRoleMutation.mutate({ spaceId: id, userId, roleId }, {
      onSuccess: () => {
        setRoleMenuUserId(null);
      },
    });
  };

  if (isLoadingMembers) {
      return <MembersListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {canAdd && <AddMemberSearch spaceId={id} memberUserIds={memberUserIds} />}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Участники ({users.length})</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {users.length > 0 ? (
              users.map((user) => {
                const isPickingRole = roleMenuUserId === user.userId;
                return (
                <div key={user.userId}>
                <DropdownMenu
                  open={menuUserId === user.userId}
                  onOpenChange={(open) => {
                    setMenuUserId(open ? user.userId : null);
                    if (!open) setRoleMenuUserId(null);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        lastPointerTypeRef.current = e.pointerType;
                        // Skips Radix's own pointerdown handler (it checks defaultPrevented)
                        if (e.pointerType !== "mouse") e.preventDefault();
                      }}
                      onClick={() => {
                        if (lastPointerTypeRef.current !== "mouse") setMenuUserId(user.userId);
                      }}
                      className="surface-panel flex w-full items-center gap-3 rounded-lg p-1.5 pr-4 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`Открыть действия для ${user.displayName || user.username}`}
                    >
                      <Avatar className="h-11 w-11 shrink-0">
                        {user.avatarUrl ? (
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={user.displayName || user.username}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback>{user.displayName?.substring(0, 2).toUpperCase() || user.username?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{user.displayName || user.username}</span>
                        {(user.username && user.displayName) && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {user.username}
                          </span>
                        )}
                      </div>
                      {user.creator && (
                        <Badge
                          variant="secondary"
                          className="min-w-0 max-w-[45%] shrink-0 rounded-full border border-[hsl(var(--panel-border-strong))] bg-[hsl(var(--panel-surface-muted))] px-2 py-0 text-xs font-semibold uppercase tracking-wide text-primary"
                        >
                          <Crown className="mr-1 h-3 w-3 shrink-0" />
                          <span className="truncate">Создатель</span>
                        </Badge>
                      )}
                      {!user.creator && user.role && user.role.isVisible && (
                        <Badge
                          variant="secondary"
                          className="min-w-0 max-w-[45%] shrink-0 rounded-full border border-[hsl(var(--panel-border-strong))] bg-[hsl(var(--panel-surface-muted))] px-2 py-0 text-xs font-semibold uppercase tracking-wide text-primary"
                        >
                          <Shield className="mr-1 h-3 w-3 shrink-0" />
                          <span className="truncate">{user.role.name}</span>
                        </Badge>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  {isPickingRole ? (
                    <DropdownMenuContent align="start" className="min-w-48">
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setRoleMenuUserId(null); }}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {isLoadingRoles ? (
                        <DropdownMenuItem disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Загрузка...
                        </DropdownMenuItem>
                      ) : roles.length === 0 ? (
                        <DropdownMenuItem disabled>
                          Нет доступных ролей
                        </DropdownMenuItem>
                      ) : (
                        roles.map((role) => (
                          <DropdownMenuItem
                            key={role.id}
                            onSelect={() => handleAssignRole(user.userId, role.id, role.name, user.displayName || user.username)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {role.name}
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  ) : (
                    <DropdownMenuContent align="start" className="min-w-48">
                      <DropdownMenuItem
                        disabled={!canAssign}
                        onSelect={(e) => { e.preventDefault(); setRoleMenuUserId(user.userId); }}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Назначить роль
                      </DropdownMenuItem>
                      {!canAssign && (
                        <p className="px-2 py-1.5 text-xs text-muted-foreground">
                          Назначение ролей доступно только создателю спейса
                        </p>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={!canDelete}
                        onSelect={() => handleRemoveUser(user.userId)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить пользователя
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
                </div>
                );
              })
            ) : (
              <p className="text-muted-foreground sm:col-span-2">Пока нет участников.</p>
            )}
        </div>
      </div>
    </div>
  );
}
