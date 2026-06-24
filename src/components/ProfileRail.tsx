import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Save, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebarStore } from "@/store/sidebarStore";
import { useProfileForm } from "@/hooks/useProfileForm";
import { ProfileRailSkeleton } from "@/components/ProfileRailSkeleton";

export function ProfileRail() {
  const active = useSidebarStore((s) => s.active);
  const setActive = useSidebarStore((s) => s.setActive);
  const open = active === "profile";

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
          <h2 className="truncate text-lg font-semibold sm:text-xl">Редактировать профиль</h2>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setActive(null)} aria-label="Закрыть панель профиля">
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Закрыть панель</TooltipContent>
        </Tooltip>
      </div>

      <ScrollArea className="flex-1">
        <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
          {isLoading ? (
            <ProfileRailSkeleton />
          ) : user ? (
            <>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user.userPic || ""} />
                  <AvatarFallback>{user.userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{user.userName || "User"}</p>
                  <p className="truncate text-sm text-muted-foreground">Обновите данные вашего профиля.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-userName">Имя пользователя</Label>
                  <Input
                    id="profile-userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Имя пользователя"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-firstName">Имя</Label>
                    <Input
                      id="profile-firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Имя"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-lastName">Фамилия</Label>
                    <Input
                      id="profile-lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Фамилия"
                    />
                  </div>
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
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No profile data available.</p>
          )}
        </form>
      </ScrollArea>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
