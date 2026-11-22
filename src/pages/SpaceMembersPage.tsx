import { useParams } from "react-router-dom";
import { useSpaceUsers, useAddUserToSpace, useDeleteUserFromSpace } from "@/hooks/useSpaces";
import { useSearchUsers } from "@/hooks/useUsers";
import { useGetRoles, useAssignRoleToUser } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus, Search, Shield, Loader2, ArrowLeft, Crown } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MembersListSkeleton } from "@/components/members/MembersListSkeleton";
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

  const addUserMutation = useAddUserToSpace();
  const removeUserMutation = useDeleteUserFromSpace();

  const [searchTerm, setSearchTerm] = useState("");
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchTerm);

  const [roleMenuUserId, setRoleMenuUserId] = useState<string | null>(null);
  const { data: rolesResponse, isLoading: isLoadingRoles } = useGetRoles(id, roleMenuUserId !== null);
  const assignRoleMutation = useAssignRoleToUser();
  const roles = rolesResponse?.roles || [];

  // Get list of user IDs already in the space
  const memberUserIds = users.map(u => u.userId);

  const handleAddUser = (userId: string) => {
      if (!canAdd) {
          notify.error.forbidden();
          return;
      }
      addUserMutation.mutate({ spaceId: id, userId }, {
          onSuccess: () => {
              setSearchTerm("");
          }
      });
  };

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
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Добавить участника</h3>
        <div className="space-y-4">
          <div className="px-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Поиск пользователей по имени (мин. 3 символа)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isSearching && <div className="text-sm text-muted-foreground">Поиск...</div>}

          {searchResults && searchResults.length > 0 && (
            <div className="surface-panel-muted max-h-60 overflow-y-auto rounded-md p-1 space-y-2 animate-in fade-in-0 slide-in-from-top-1 duration-150">
              {searchResults.map((user) => {
                const isMember = memberUserIds.includes(user.id);
                return (
                  <div key={user.id} className="surface-panel flex items-center justify-between rounded-lg p-1.5 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 shrink-0">
                        {user.avatarUrl ? (
                          <AvatarImage src={user.avatarUrl} alt={user.displayName} className="object-cover" />
                        ) : null}
                        <AvatarFallback>{user.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.displayName}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={isMember || addUserMutation.isPending || !canAdd}
                      onClick={() => handleAddUser(user.id)}
                    >
                      {isMember ? "Участник" : <><UserPlus className="mr-2 h-3 w-3" /> Добавить</>}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          {searchTerm.length >= 3 && searchResults?.length === 0 && !isSearching && (
            <p className="text-sm text-muted-foreground">Пользователи не найдены.</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Участники ({users.length})</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {users.length > 0 ? (
              users.map((user) => {
                const isPickingRole = roleMenuUserId === user.userId;
                return (
                <div key={user.userId}>
                <DropdownMenu
                  open={isPickingRole || undefined}
                  onOpenChange={(open) => {
                    if (!open && !isPickingRole) return;
                    if (!open) setRoleMenuUserId(null);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
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
