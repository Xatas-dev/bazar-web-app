import { useParams } from "react-router-dom";
import { useSpaceUsers, useAddUserToSpace, useDeleteUserFromSpace } from "@/hooks/useSpaces";
import { useSearchUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, UserPlus, Search, Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AssignRoleDialog from "@/components/role/AssignRoleDialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function SpaceMembersPage({ canAssign, canAdd, canDelete }: { canAssign?: boolean; canAdd?: boolean; canDelete?: boolean }) {
  const { spaceId } = useParams();
  const id = Number(spaceId);
  const { data: spaceUsersResponse, isLoading: isLoadingMembers } = useSpaceUsers(id);
  const users = spaceUsersResponse?.users || [];

  const addUserMutation = useAddUserToSpace();
  const removeUserMutation = useDeleteUserFromSpace();

  const [searchTerm, setSearchTerm] = useState("");
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchTerm);

  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<{ id: string; userName: string | null } | null>(null);
  const { toast } = useToast();

  // Get list of user IDs already in the space
  const memberUserIds = users.map(u => u.userId);

  const handleAddUser = (userId: string) => {
      if (!canAdd) {
          toast({ title: 'Нет прав', description: 'У вас нет прав на добавление пользователей в пространство', variant: 'destructive' });
          return;
      }
      addUserMutation.mutate({ spaceId: id, userId }, {
          onSuccess: () => {
              // Optionally clear search
              setSearchTerm("");
          }
      });
  };

  const handleRemoveUser = (userId: string) => {
    if (!canDelete) {
        toast({ title: 'Нет прав', description: 'У вас нет прав на удаление пользователей из пространства', variant: 'destructive' });
        return;
    }
    if (confirm("Remove user from space?")) {
        removeUserMutation.mutate({ spaceId: id, userId });
    }
  };

  if (isLoadingMembers) {
      return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search users by username (min 3 chars)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isSearching && <div className="text-sm text-muted-foreground">Searching...</div>}

            {searchResults && searchResults.length > 0 && (
                <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                    {searchResults.map(user => {
                        const isMember = memberUserIds.includes(user.id);
                        return (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.userPic || ""} />
                                        <AvatarFallback>{user.userName?.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{user.userName}</span>
                                        {(user.firstName || user.lastName) && (
                                            <span className="text-xs text-muted-foreground">{user.firstName} {user.lastName}</span>
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
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Members ({users.length})</h3>
        <div className="grid gap-4">
            {users.length > 0 ? (
              users.map((user) => (
                <Card key={user.userId}>
                    <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 flex-1">
                        <Avatar>
                            <AvatarFallback>{user.userName?.substring(0,2).toUpperCase() || "??"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1">
                            <span className="font-medium">{user.userName}</span>
                            {(user.firstName || user.lastName) && (
                                <span className="text-xs text-muted-foreground">{user.firstName} {user.lastName}</span>
                            )}
                            {user.role && user.role.isVisible && (
                                <Badge
                                  variant="secondary"
                                  className="mt-1 w-fit rounded-full border border-primary/20 bg-primary/10 px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-primary"
                                >
                                  <Shield className="mr-1 h-3 w-3" />
                                  {user.role.name}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                                {canAssign ? (
                                  <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                          setSelectedUserForRole({ id: user.userId, userName: user.userName });
                                          setAssignRoleDialogOpen(true);
                                      }}
                                      title="Назначить роль"
                                  >
                                      <Shield className="h-4 w-4" />
                                  </Button>
                                        ) : (
                                          <Button
                                              variant="outline"
                                              size="icon"
                                              className="opacity-50"
                                              onClick={() => toast({ title: 'Нет прав', description: 'У вас нет прав на назначение ролей', variant: 'destructive' })}
                                              title="Нет прав"
                                          >
                                              <Shield className="h-4 w-4" />
                                          </Button>
                                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            disabled={!canDelete}
                            onClick={() => handleRemoveUser(user.userId)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No members yet.</p>
            )}
        </div>
      </div>

      <AssignRoleDialog
        spaceId={id}
        userId={selectedUserForRole?.id || ""}
        userName={selectedUserForRole?.userName || ""}
        isOpen={assignRoleDialogOpen}
        onOpenChange={setAssignRoleDialogOpen}
      />
    </div>
  );
}

