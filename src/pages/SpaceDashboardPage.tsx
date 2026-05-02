import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteSpace, usePatchSpace, useSpaces } from "@/hooks/useSpaces";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Box, Save } from "lucide-react";
import SpaceMembersPage from "@/pages/SpaceMembersPage";
import { ChatTab } from "@/components/chat/ChatTab";
import { StorageTab } from "@/components/storage/StorageTab";
import { useToast } from "@/hooks/use-toast";

export default function SpaceDashboardPage() {
  const { spaceId } = useParams();
  const id = Number(spaceId);
  const deleteSpaceMutation = useDeleteSpace();
  const patchSpaceMutation = usePatchSpace();
  const { data: spacesData } = useSpaces();
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentSpace = spacesData?.spaces.find(s => s.id === id);
  const [spaceName, setSpaceName] = useState("");

  useEffect(() => {
    if (currentSpace) {
      setSpaceName(currentSpace.name);
    }
  }, [currentSpace]);

  const handleDeleteSpace = () => {
    if (confirm("Are you sure you want to delete this space?")) {
        deleteSpaceMutation.mutate(id, {
            onSuccess: () => {
                navigate('/spaces');
            }
        });
    }
  };

  const handleUpdateSpace = () => {
     if (!spaceName.trim()) {
        toast({
            title: "Error",
            description: "Space name is required",
            variant: "destructive"
        });
        return;
    }
    patchSpaceMutation.mutate({ spaceId: id, name: spaceName }, {
        onSuccess: () => {
             toast({
                title: "Success",
                description: "Space updated successfully",
            });
        },
         onError: () => {
             toast({
                title: "Error",
                description: "Failed to update space",
                variant: "destructive"
            });
        }
    });
  };

  return (
    <div className="flex flex-col h-full">
        {/* Tabs Header */}
        <div className="border-b px-2 sm:px-4 pt-2 bg-card">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center pt-4">
                <Box className="mr-2 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <span className="truncate">{currentSpace ? currentSpace.name : `Space #${id}`}</span>
            </h2>
            <Tabs defaultValue="chat" className="w-full">
                <TabsList className="w-full justify-start bg-transparent p-0 h-auto rounded-none border-b border-transparent overflow-x-auto">
                    <TabsTrigger
                        value="chat"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 py-2 text-sm sm:text-base"
                    >
                        Chat
                    </TabsTrigger>
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 py-2 text-sm sm:text-base"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="members"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 py-2 text-sm sm:text-base"
                    >
                        Members
                    </TabsTrigger>
                    <TabsTrigger
                        value="storage"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 sm:px-4 py-2 text-sm sm:text-base whitespace-nowrap"
                    >
                        Storage
                    </TabsTrigger>
                </TabsList>

                {/* Content Area */}
                <div className="p-3 sm:p-6">
                    <TabsContent value="overview" className="mt-0 space-y-4">
                         <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-lg sm:text-xl">Space Settings</CardTitle>
                                <CardDescription>Manage your space configuration.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                                <div className="space-y-4">
                                     <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="spaceName">Space Name</Label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Input
                                                id="spaceName"
                                                value={spaceName}
                                                onChange={(e) => setSpaceName(e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button onClick={handleUpdateSpace} disabled={patchSpaceMutation.isPending} className="w-full sm:w-auto">
                                                {patchSpaceMutation.isPending ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save</>}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-destructive/10 border-destructive/20 mt-8 gap-4">
                                        <div>
                                            <h3 className="font-medium text-destructive">Delete Space</h3>
                                            <p className="text-sm text-muted-foreground">Permanently remove this space and all its data.</p>
                                        </div>
                                        <Button variant="destructive" onClick={handleDeleteSpace} className="w-full sm:w-auto">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Space
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="members" className="mt-0">
                        {/* We reuse the Members Page component logic here by rendering it,
                            but we might need to adjust it to fit inside the tab or refactor it
                            to not have its own full page header if desired.
                            For now, we'll wrap it or just render it.
                            SpaceMembersPage expects params to be present, which they are.
                        */}
                         <div className="border rounded-lg p-4 bg-background">
                            <SpaceMembersPage />
                         </div>
                    </TabsContent>

                    <TabsContent value="chat" className="mt-0">
                         <ChatTab spaceId={id} />
                    </TabsContent>

                    <TabsContent value="storage" className="mt-0">
                         <StorageTab spaceId={id} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    </div>
  );
}
