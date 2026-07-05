import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateSpace } from "@/hooks/useSpaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Box } from "lucide-react";
import { notify } from "@/lib/notifications";

export default function HomePage() {
  const createSpaceMutation = useCreateSpace();
  const [newSpaceName, setNewSpaceName] = useState("");
  const navigate = useNavigate();

  const handleCreateSpace = (event?: FormEvent) => {
    event?.preventDefault();

    if (!newSpaceName.trim()) {
      notify.error.validation("Название спейса обязательно.");
      return;
    }
    createSpaceMutation.mutate(newSpaceName, {
      onSuccess: (newSpace) => {
        setNewSpaceName("");
        navigate(`/spaces/${newSpace.id}`);
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="surface-panel-muted inline-flex rounded-full p-6 mb-2">
            <Box className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Добро пожаловать в Bazar Space</h1>
          <p className="text-muted-foreground">
            Выберите спейс из боковой панели, чтобы просмотреть детали, или создайте новый.
          </p>
        <form className="pt-4 flex flex-col gap-2" onSubmit={handleCreateSpace}>
            <Input
              placeholder="Введите название спейса"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
            />
          <Button type="submit" disabled={createSpaceMutation.isPending} size="lg" className="w-full">
              {createSpaceMutation.isPending ? "Создание..." : <><Plus className="mr-2 h-4 w-4" /> Создать спейс</>}
            </Button>
        </form>
        </CardContent>
      </Card>
    </div>
  );
}
