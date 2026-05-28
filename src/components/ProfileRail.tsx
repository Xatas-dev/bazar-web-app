import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Save, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useUser, useUpdateProfile } from "@/hooks/useUser";
import { useSidebarStore } from "@/store/sidebarStore";
import { ProfileRailSkeleton } from "@/components/ProfileRailSkeleton";
import { notify } from "@/lib/notifications";

export function ProfileRail() {
  const active = useSidebarStore((s) => s.active);
  const setActive = useSidebarStore((s) => s.setActive);
  const open = active === "profile";

  const { user, isLoading } = useUser();
  const updateProfileMutation = useUpdateProfile();
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      userName: user.userName || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    });
  }, [user]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        notify.success("Your profile has been updated.");
      },
    });
  };

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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Profile</p>
          <h2 className="truncate text-lg font-semibold sm:text-xl">Edit profile</h2>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setActive(null)} aria-label="Close profile panel">
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Close panel</TooltipContent>
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
                  <p className="truncate text-sm text-muted-foreground">Update your profile details.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-userName">Username</Label>
                  <Input
                    id="profile-userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Username"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-firstName">First name</Label>
                    <Input
                      id="profile-firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-lastName">Last name</Label>
                    <Input
                      id="profile-lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                {updateProfileMutation.isPending ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <Button type="submit" size="icon" disabled>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="left">Saving...</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="submit" size="icon">
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Save changes</TooltipContent>
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
