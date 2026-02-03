import { useState } from "react";
import { useCreateSpace } from "@/hooks/useSpaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Box } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const createSpaceMutation = useCreateSpace();
  const [newSpaceName, setNewSpaceName] = useState("");
  const { toast } = useToast();

  const handleCreateSpace = () => {
    if (!newSpaceName.trim()) {
        toast({
            title: "Error",
            description: "Space name is required",
            variant: "destructive"
        });
        return;
    }
    createSpaceMutation.mutate(newSpaceName, {
        onSuccess: () => {
            setNewSpaceName("");
            toast({
                title: "Success",
                description: "Space created successfully",
            });
        },
        onError: () => {
             toast({
                title: "Error",
                description: "Failed to create space",
                variant: "destructive"
            });
        }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="max-w-md space-y-4 w-full">
        <div className="bg-primary/10 p-6 rounded-full inline-block mb-4">
             <Box className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Bazar Space</h1>
        <p className="text-muted-foreground">
          Select a space from the sidebar to view details, or create a new space to get started.
        </p>
        <div className="pt-4 flex flex-col gap-2">
            <Input
                placeholder="Enter space name"
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
            />
            <Button onClick={handleCreateSpace} disabled={createSpaceMutation.isPending} size="lg" className="w-full">
              {createSpaceMutation.isPending ? "Creating..." : <><Plus className="mr-2 h-4 w-4" /> Create New Space</>}
            </Button>
        </div>
      </div>
    </div>
  );
}
