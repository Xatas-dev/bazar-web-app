import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Save, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RightDrawer } from "@/components/RightDrawer";
import { usePanel } from "@/hooks/usePanel";
import { useProfileForm } from "@/hooks/useProfileForm";
import { ProfileRailSkeleton } from "@/components/ProfileRailSkeleton";
import { AvatarEditor } from "@/components/AvatarEditor";
import { useUpdateAvatar } from "@/hooks/useUser";

export function ProfileRail() {
  const { active, close } = usePanel();
  const open = active === "profile";

  const { user, isLoading, formData, handleChange, handleSubmit, isPending } = useProfileForm();
  const updateAvatarMutation = useUpdateAvatar();

  return (
    <RightDrawer open={open} onClose={close} aria-label="Мой профиль">
      <div className="surface-shell flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Профиль</p>
          <h2 className="truncate text-lg font-semibold sm:text-xl">Мой профиль</h2>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={close} aria-label="Закрыть панель профиля" className="h-11 w-11 sm:h-10 sm:w-10">
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Закрыть панель</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <ProfileRailSkeleton />
        ) : user ? (
            <form onSubmit={handleSubmit} className="space-y-8 px-5 pb-6 sm:px-7">
              <div className="pb-4 pt-16">
                <AvatarEditor
                  name={user.displayName || user.username || "Пользователь"}
                  avatarUrl={user.avatarUrl}
                  upload={(file) => updateAvatarMutation.mutateAsync(file)}
                  isUploading={updateAvatarMutation.isPending}
                  editLabel="Изменить фотографию профиля"
                  successDescription="Новая фотография профиля сохранена."
                />
              </div>

              <div className="flex gap-2">
                <Input
                  id="profile-displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Отображаемое имя"
                  aria-label="Отображаемое имя"
                  className="flex-1"
                />
                {isPending ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <Button type="submit" size="icon" disabled aria-label="Сохранение">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left">Сохранение...</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="submit" size="icon" aria-label="Сохранить изменения">
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Сохранить изменения</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </form>

        ) : (
          <p className="p-4 text-sm text-muted-foreground sm:p-6">Не удалось загрузить данные профиля.</p>
        )}
      </ScrollArea>
    </RightDrawer>
  );
}
