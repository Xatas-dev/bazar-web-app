import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteSpace } from "@/hooks/useSpaces";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Box } from "lucide-react";
import SpaceMembersPage from "@/pages/SpaceMembersPage";

export default function SpaceDashboardPage() {
  const { spaceId } = useParams();
  const id = Number(spaceId);
  const deleteSpaceMutation = useDeleteSpace();
  const navigate = useNavigate();

  const handleDeleteSpace = () => {
    if (confirm("Are you sure you want to delete this space?")) {
        deleteSpaceMutation.mutate(id, {
            onSuccess: () => {
                navigate('/spaces');
            }
        });
    }
  };

  return (
    <div className="flex flex-col h-full">
        {/* Tabs Header */}
        <div className="border-b px-4 pt-2 bg-card">
            <h2 className="text-2xl font-bold mb-4 flex items-center pt-4">
                <Box className="mr-2 h-6 w-6" /> Space #{id}
            </h2>
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start bg-transparent p-0 h-auto rounded-none border-b border-transparent">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="members"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                    >
                        Members
                    </TabsTrigger>
                    <TabsTrigger
                        value="chat"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                        disabled
                    >
                        Chat (Soon)
                    </TabsTrigger>
                    <TabsTrigger
                        value="storage"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                        disabled
                    >
                        Storage (Soon)
                    </TabsTrigger>
                </TabsList>

                {/* Content Area */}
                <div className="p-6">
                    <TabsContent value="overview" className="mt-0 space-y-4">
                         <Card>
                            <CardHeader>
                                <CardTitle>Space Settings</CardTitle>
                                <CardDescription>Manage your space configuration.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-destructive/10 border-destructive/20">
                                        <div>
                                            <h3 className="font-medium text-destructive">Delete Space</h3>
                                            <p className="text-sm text-muted-foreground">Permanently remove this space and all its data.</p>
                                        </div>
                                        <Button variant="destructive" onClick={handleDeleteSpace}>
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
                </div>
            </Tabs>
        </div>
    </div>
  );
}
