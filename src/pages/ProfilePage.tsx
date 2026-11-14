import { useState } from "react";
import { useProfileForm } from "@/hooks/useProfileForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ProfilePageSkeleton } from "@/pages/ProfilePageSkeleton";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Loader2, Pencil, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, formData, handleChange, handleSubmit, isPending } = useProfileForm();
  const [editMode, setEditMode] = useState(false);

  if (isLoading) {
      return <ProfilePageSkeleton />;
  }

  if (!user) {
      return <div className="p-8">Пожалуйста, войдите в систему.</div>;
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <div className="flex w-full items-center gap-4">
            <ProfileAvatar user={user} className="h-16 w-16" editable={editMode} />
            <div className="min-w-0 flex-1">
              <CardTitle>{editMode ? "Редактировать профиль" : "Мой профиль"}</CardTitle>
              <CardDescription>
                {editMode ? "Обновите вашу личную информацию." : user.username}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditMode((v) => !v)}
              aria-label={editMode ? "Вернуться к просмотру профиля" : "Редактировать профиль"}
            >
              {editMode ? <ArrowLeft className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {editMode ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Отображаемое имя</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Отображаемое имя"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить
              </Button>
            </CardFooter>
          </form>
        ) : null}
      </Card>
    </div>
  );
}