import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Save, Loader2, Pencil, ArrowLeft } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebarStore } from "@/store/sidebarStore";
import { useProfileForm } from "@/hooks/useProfileForm";
import { ProfileRailSkeleton } from "@/components/ProfileRailSkeleton";
import { ProfileAvatar } from "@/components/ProfileAvatar";

export function ProfileRail() {
  const active = useSidebarStore((s) => s.active);
  const setActive = useSidebarStore((s) => s.setActive);
  const open = active === "profile";
  const [editMode, setEditMode] = useState(false);

  const { user, isLoading, formData, handleChange, handleSubmit, isPending } = useProfileForm();

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "40rem", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="surface-shell hidden h-full shrink-0 flex-col border-l border-border overflow-hidden md:flex"
          style={{ maxWidth: "var(--right-sidebar-width)" }}
        >
      <div className="surface-shell flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Профиль</p>
          <h2 className="truncate text-lg font-semibold sm:text-xl">
            {editMode ? "Редактировать профиль" : "Мой профиль"}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              {editMode ? (
                <Button variant="ghost" size="icon" onClick={() => setEditMode(false)} aria-label="Вернуться к просмотру профиля">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setEditMode(true)} aria-label="Редактировать профиль">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </TooltipTrigger>
            <TooltipContent side="left">
              {editMode ? "Вернуться к просмотру" : "Редактировать профиль"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setActive(null)} aria-label="Закрыть панель профиля">
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
          editMode ? (
            <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <ProfileAvatar user={user} className="h-14 w-14" editable={editMode} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{user.displayName || "User"}</p>
                  <p className="truncate text-sm text-muted-foreground">Обновите данные вашего профиля.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-displayName">Отображаемое имя</Label>
                  <Input
                    id="profile-displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Отображаемое имя"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                {isPending ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <Button type="submit" size="icon" disabled>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left">Сохранение...</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="submit" size="icon">
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Сохранить изменения</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-4 p-4 sm:p-6">
              <ProfileAvatar user={user} className="h-14 w-14" />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{user.displayName || "User"}</p>
                <p className="truncate text-sm text-muted-foreground">{user.username}</p>
              </div>
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">No profile data available.</p>
        )}
      </ScrollArea>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
