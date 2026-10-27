import { useProfileForm } from "@/hooks/useProfileForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfilePageSkeleton } from "@/pages/ProfilePageSkeleton";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, formData, handleChange, handleSubmit, isPending } = useProfileForm();

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
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                  <AvatarFallback>{user.displayName?.substring(0,2).toUpperCase() || "??"}</AvatarFallback>
              </Avatar>
              <div>
                  <CardTitle>Редактировать профиль</CardTitle>
                  <CardDescription>Обновите вашу личную информацию.</CardDescription>
              </div>
          </div>
        </CardHeader>
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
      </Card>
    </div>
  );
}
