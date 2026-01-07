import { useParams } from "react-router-dom";
import { useSpaceUsers, useAddUserToSpace, useDeleteUserFromSpace } from "@/hooks/useSpaces";
import { useUsers, useSearchUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, UserPlus, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SpaceMembersPage() {
  const { spaceId } = useParams();
  const id = Number(spaceId);
  const { data: userIds, isLoading: isLoadingIds } = useSpaceUsers(id);
  const { data: users, isLoading: isLoadingUsers } = useUsers(userIds || []);

  const addUserMutation = useAddUserToSpace();
  const removeUserMutation = useDeleteUserFromSpace();

  const [searchTerm, setSearchTerm] = useState("");
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchTerm);

  const handleAddUser = (userId: string) => {
      addUserMutation.mutate({ spaceId: id, userId }, {
          onSuccess: () => {
              // Optionally clear search
              setSearchTerm("");
          }
      });
  };

  const handleRemoveUser = (userId: string) => {
    if (confirm("Remove user from space?")) {
        removeUserMutation.mutate({ spaceId: id, userId });
    }
  };

  if (isLoadingIds || (userIds && userIds.length > 0 && isLoadingUsers)) {
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
                        const isMember = userIds?.includes(user.id);
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
                                    disabled={isMember || addUserMutation.isPending}
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
        <h3 className="text-lg font-medium">Members ({users?.length || 0})</h3>
        <div className="grid gap-4">
            {users?.map((user) => (
            <Card key={user.id}>
                <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={user.userPic || ""} />
                        <AvatarFallback>{user.userName?.substring(0,2).toUpperCase() || "??"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{user.userName}</span>
                         {(user.firstName || user.lastName) && (
                            <span className="text-xs text-muted-foreground">{user.firstName} {user.lastName}</span>
                        )}
                        {/* <span className="text-xs text-muted-foreground">{user.id}</span> */}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleRemoveUser(user.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                </CardContent>
            </Card>
            ))}
            {(!users || users.length === 0) && <p className="text-muted-foreground">No members yet.</p>}
        </div>
      </div>
    </div>
  );
}

