import { useParams } from "react-router-dom";
import { useSpaceUsers, useAddUserToSpace, useDeleteUserFromSpace } from "@/hooks/useSpaces";
import { useSearchUsers } from "@/hooks/useUsers";
import { useGetRoles, useAssignRoleToUser } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus, Search, Shield, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MembersListSkeleton } from "@/components/members/MembersListSkeleton";
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

  const handleRemoveUser = (userId: string) => {
    if (!canDelete) {
        notify.error.forbidden();
        return;
    }
    if (confirm("Remove user from space?")) {
        removeUserMutation.mutate({ spaceId: id, userId });
    }
  };

  const handleAssignRole = (userId: string, roleId: number, roleName: string, userName: string | null) => {
    assignRoleMutation.mutate({ spaceId: id, userId, roleId }, {
      onSuccess: () => {
        notify.success(`Role "${roleName}" assigned to ${userName}.`);
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
        <h3 className="text-lg font-medium">Add Member</h3>
        <div className="space-y-4">
          <div className="px-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search users by username (min 3 chars)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isSearching && <div className="text-sm text-muted-foreground">Searching...</div>}

          {searchResults && searchResults.length > 0 && (
            <div className="surface-panel-muted max-h-60 overflow-y-auto rounded-md p-1 space-y-2 animate-in fade-in-0 slide-in-from-top-1 duration-150">
              {searchResults.map((user) => {
                const isMember = memberUserIds.includes(user.id);
                return (
                  <div key={user.id} className="surface-panel flex items-center justify-between rounded-md p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.userPic || ""} />
                        <AvatarFallback>{user.userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.userName}</span>
                        {(user.firstName || user.lastName) && (
                          <span className="text-xs text-muted-foreground">
                            {user.firstName} {user.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={isMember || addUserMutation.isPending || !canAdd}
                      onClick={() => handleAddUser(user.id)}
                    >
                      {isMember ? "Joined" : <><UserPlus className="mr-2 h-3 w-3" /> Add</>}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          {searchTerm.length >= 3 && searchResults?.length === 0 && !isSearching && (
            <p className="text-sm text-muted-foreground">No users found.</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Members ({users.length})</h3>
        <div className="space-y-2">
            {users.length > 0 ? (
              users.map((user, i) => {
                const isPickingRole = roleMenuUserId === user.userId;
                return (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                >
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
                      className="surface-panel flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`Open actions for ${user.userName}`}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback>{user.userName?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{user.userName}</span>
                        {(user.firstName || user.lastName) && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {user.firstName} {user.lastName}
                          </span>
                        )}
                      </div>
                      {user.role && user.role.isVisible && (
                        <Badge
                          variant="secondary"
                          className="shrink-0 rounded-full border border-[hsl(var(--panel-border-strong))] bg-[hsl(var(--panel-surface-muted))] px-2 py-0 text-xs font-semibold uppercase tracking-wide text-primary"
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          {user.role.name}
                        </Badge>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  {isPickingRole ? (
                    <DropdownMenuContent align="start" className="min-w-48">
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setRoleMenuUserId(null); }}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {isLoadingRoles ? (
                        <DropdownMenuItem disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </DropdownMenuItem>
                      ) : roles.length === 0 ? (
                        <DropdownMenuItem disabled>
                          No roles available
                        </DropdownMenuItem>
                      ) : (
                        roles.map((role) => (
                          <DropdownMenuItem
                            key={role.id}
                            onSelect={() => handleAssignRole(user.userId, role.id, role.name, user.userName)}
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
                        Assign role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={!canDelete}
                        onSelect={() => handleRemoveUser(user.userId)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Kick user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
                </motion.div>
                );
              })
            ) : (
              <p className="text-muted-foreground">No members yet.</p>
            )}
        </div>
      </div>
    </div>
  );
}
