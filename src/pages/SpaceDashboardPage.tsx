import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteSpace, useDeleteUserFromSpace, usePatchSpace, useSpaces } from "@/hooks/useSpaces";
import { useUser } from "@/hooks/useUser";
import { usePanel } from "@/hooks/usePanel";
import { BREAKPOINTS, useMediaQuery } from "@/hooks/useMediaQuery";
import { confirmDialog } from "@/lib/dialogs";
import { Button } from "@/components/ui/button";
import { useGetRole, useGetUserRoles } from "@/hooks/useRoles";
import { ArrowLeft, EllipsisVertical, EyeOff, HardDrive, LogOut, MessageSquare, Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GetSpacesResponse } from "@/types/space";
import { AnimatePresence, motion } from "framer-motion";
import { ChatTab } from "@/components/chat/ChatTab";
import { StorageTab } from "@/components/storage/StorageTab";
import { getPermissionKey, SPACE_PERMISSIONS } from "@/lib/permissions";
import { ProfileRail } from "@/components/ProfileRail";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/lib/notifications";
import { SpaceSettingsDrawer } from "@/components/spaces/SpaceSettingsDrawer";
import { SpaceAvatar } from "@/components/spaces/SpaceAvatar";

// `invisible` alone lags: buttons with `transition-all` animate their inherited `visibility`, so they
// linger after the switch. `opacity-0` on the panel hides everything instantly; `invisible` keeps
// the hidden tab out of focus order and the accessibility tree.
const workspaceContentClass =
  "mt-0 min-h-0 overflow-visible [grid-area:1/1] data-[state=inactive]:pointer-events-none data-[state=inactive]:invisible data-[state=inactive]:opacity-0";
const sharedTabsListClass = "surface-panel-muted inline-flex h-auto gap-1 rounded-full p-1 text-muted-foreground";
const sharedTabsTriggerClass =
  "group inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full px-3 max-md:w-10 max-md:px-0 text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground";
// Phones: icon-only 40px squares, labels never expand (`max-md:`); desktop keeps the expanding label
const sharedTabsLabelClass =
  "max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-24 group-hover:opacity-100 group-data-[state=active]:max-w-24 group-data-[state=active]:opacity-100 max-md:hidden";

function WorkspaceTabsTrigger({
  value,
  icon: Icon,
  label,
  disabled,
  title,
}: {
  value: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <TabsTrigger
      value={value}
      disabled={disabled}
      title={title}
      className={sharedTabsTriggerClass}
      aria-label={label}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!disabled && <span className={sharedTabsLabelClass}>{label}</span>}
    </TabsTrigger>
  );
}

export default function SpaceDashboardPage() {
  const { spaceId } = useParams();
  const id = Number(spaceId);
  const { user } = useUser();
  const userId = user?.id;
  const { data: userRolesResponse } = useGetUserRoles(id, userId ? [userId] : []);
  const assignedRoleId = userRolesResponse?.roles && userRolesResponse.roles.length > 0 ? userRolesResponse.roles[0].id : undefined;
  const { data: assignedRole } = useGetRole(id, assignedRoleId as number | undefined);
   const [searchParams] = useSearchParams();
   const [workspaceTab, setWorkspaceTab] = useState<"chat" | "storage">("chat");

  const isCreator = !!userRolesResponse?.roles?.some((r) => r.isCreator === true);
  const allowedPermissions = isCreator ? new Set<string>() : new Set<string>((assignedRole?.actions || []).map(getPermissionKey));
  const canReadRoles = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.rolesRead);
  const canCreateRoles = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.rolesCreate);
  const canAssignRoles = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.rolesAssign);
  const canEditRoles = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.rolesEdit);
  const canDeleteSpace = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.spaceDelete);
  const canWriteSpace = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.spaceWrite);
  const canAddMember = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.spaceUserAdd);
  const canDeleteMember = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.spaceUserDelete);
  const canReadChat = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.chatRead);
  const canWriteChat = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.chatWrite);
  const canUploadStorage = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.storageUpload);
  const canDownloadStorage = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.storageDownload);
  const canDeleteStorage = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.storageDelete);
  const canReadStorage = isCreator ? true : allowedPermissions.has(SPACE_PERMISSIONS.storageRead);

  const deleteSpaceMutation = useDeleteSpace();
  const leaveSpaceMutation = useDeleteUserFromSpace();
  const queryClient = useQueryClient();
  const patchSpaceMutation = usePatchSpace();
  const { data: spacesData, isLoading: isSpacesLoading } = useSpaces();
  const navigate = useNavigate();

   const currentSpace = spacesData?.spaces.find((s) => s.id === id);
   const [spaceName, setSpaceName] = useState("");
  const panel = usePanel();
  const isDesktop = useMediaQuery(BREAKPOINTS.md);

  useEffect(() => {
    if (currentSpace) {
      setSpaceName(currentSpace.name);
    }
  }, [currentSpace]);

   useEffect(() => {
     setWorkspaceTab("chat");
   }, [id]);

  // Tabs opened at least once in this space stay mounted (lazy keep-alive)
  const [visitedTabs, setVisitedTabs] = useState<{ spaceId: number; tabs: string[] }>({ spaceId: id, tabs: [] });
  const visitedHere = visitedTabs.spaceId === id ? visitedTabs.tabs : [];
  if (!visitedHere.includes(workspaceTab)) {
    setVisitedTabs({ spaceId: id, tabs: [...visitedHere, workspaceTab] });
  }
  const isTabMounted = (tab: string) => tab === workspaceTab || visitedHere.includes(tab);

   useEffect(() => {
     const nextTab = searchParams.get("chatId") ? "chat" : searchParams.get("tab") ?? "chat";
     if (nextTab === "chat" || nextTab === "storage") {
       setWorkspaceTab(nextTab as "chat" | "storage");
     }
   }, [searchParams]);

  useEffect(() => {
    const permissionsResolved = isCreator || !!assignedRole;
    if (userRolesResponse && permissionsResolved) {
      if (!canReadChat && !canReadStorage) return;
      if (!canReadChat && workspaceTab === "chat") {
        setWorkspaceTab("storage");
      } else if (!canReadStorage && workspaceTab === "storage") {
        setWorkspaceTab("chat");
      }
    }
  }, [canReadChat, canReadStorage, workspaceTab, userRolesResponse, isCreator, assignedRole]);

  const handleDeleteSpace = async () => {
    const confirmed = await confirmDialog({
      title: "Удалить спейс?",
      description: "Чат, файлы и роли этого спейса будут удалены без возможности восстановления.",
      confirmLabel: "Удалить",
      destructive: true,
    });
    if (!confirmed) return;
    deleteSpaceMutation.mutate(id, {
      onSuccess: () => {
        navigate("/spaces", { replace: true });
      },
    });
  };

  // Phones: pop back to the space list when we came from it, otherwise go there
  // Same endpoint as removing a member in the Участники tab, with the current (iam) user's id
  const handleLeaveSpace = async () => {
    if (!userId) return;
    const confirmed = await confirmDialog({
      title: "Выйти из спейса?",
      description: "Вы потеряете доступ к чату и файлам. Вернуться можно только по приглашению.",
      confirmLabel: "Выйти",
      destructive: true,
    });
    if (!confirmed) return;
    leaveSpaceMutation.mutate(
      { spaceId: id, userId },
      {
        onSuccess: () => {
          queryClient.setQueryData<GetSpacesResponse>(["spaces"], (old) =>
            old ? { ...old, spaces: old.spaces.filter((space) => space.id !== id) } : old
          );
          navigate("/spaces", { replace: true });
        },
      }
    );
  };

  const handleBack = () => {
    if (panel.state.fromList) navigate(-1);
    else navigate("/spaces", { replace: true });
  };

  const workspaceTabsList = (
    <TabsList className={sharedTabsListClass}>
      <WorkspaceTabsTrigger
        value="chat"
        icon={MessageSquare}
        label="Чат"
        disabled={!canReadChat}
        title={!canReadChat ? "У вас нет прав на просмотр чата" : "Чат"}
      />
      <WorkspaceTabsTrigger
        value="storage"
        icon={HardDrive}
        label="Хранилище"
        disabled={!canReadStorage}
        title={!canReadStorage ? "У вас нет прав на просмотр хранилища" : "Хранилище"}
      />
    </TabsList>
  );

  const handleUpdateSpace = (options?: { onSuccess?: () => void }) => {
    if (!spaceName.trim()) {
      notify.error.validation("Название спейса обязательно.");
      return;
    }

    patchSpaceMutation.mutate(
        { spaceId: id, name: spaceName.trim() },
        { onSuccess: () => options?.onSuccess?.() }
    );
  };

  return (
    <Tabs
      value={workspaceTab}
      onValueChange={(value) => setWorkspaceTab(value as "chat" | "storage")}
      className="flex h-full min-h-0 flex-col overflow-clip"
    >
      <div className="surface-shell relative z-20 flex-shrink-0 border-b border-border px-1 py-1 md:px-4 md:py-2">
        <div className="flex items-center gap-1 md:gap-3">
          {!isDesktop ? (
            <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" onClick={handleBack} aria-label="К списку спейсов">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : null}
          <button
            type="button"
            onClick={() => panel.open("space-settings")}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-accent md:flex-initial md:px-2 md:py-2 md:active:bg-transparent"
            aria-expanded={panel.active === "space-settings"}
            aria-controls="space-settings-drawer"
            aria-label={`Настройки спейса ${currentSpace?.name ?? ""}`.trim()}
            title="Открыть настройки спейса"
          >
            {isSpacesLoading ? (
              <Skeleton className="h-10 w-10 shrink-0 rounded-full md:h-11 md:w-11" />
            ) : (
              <SpaceAvatar
                name={currentSpace?.name ?? `Спейс #${id}`}
                avatarUrl={currentSpace?.avatarUrl}
                className="h-10 w-10 shrink-0 md:h-11 md:w-11"
                fallbackClassName="text-sm"
              />
            )}
            {/* min-w-0 + truncate: a long name shrinks first and never pushes the tab switcher out */}
            <h1 className="min-w-0 flex-1 truncate text-lg font-bold md:flex-initial md:text-2xl">
              <AnimatePresence mode="wait">
                <motion.span
                  key={id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isSpacesLoading ? (
                    <Skeleton className="h-7 w-32 md:h-8 md:w-56" />
                  ) : currentSpace ? (
                    currentSpace.name
                  ) : (
                    `Спейс #${id}`
                  )}
                </motion.span>
              </AnimatePresence>
            </h1>
            <Settings2 className="hidden h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground md:block" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-11 w-11 shrink-0 rounded-full md:h-10 md:w-10"
                aria-label="Действия со спейсом"
              >
                <EllipsisVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuItem
                onSelect={handleLeaveSpace}
                disabled={!userId || leaveSpaceMutation.isPending}
                className="h-11 gap-3 text-destructive focus:text-destructive md:h-9"
              >
                <LogOut className="h-4 w-4" />
                Выйти из спейса
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-stretch overflow-clip">
        <div className="flex min-h-0 flex-1 flex-col overflow-clip">
          {/* Keyed so per-space state (reply draft, folder) resets; no fade — it read as a blink */}
          <div key={id} className="flex min-h-0 flex-1 flex-col">
              {/* Floating pill (top-right on phones, top-left on desktop); the chat scrolls underneath it */}
              <div className="relative z-20 flex-shrink-0 px-3 pb-2 pt-2 md:px-4 md:pb-3 md:pt-0">
                <div className="relative flex items-center justify-end gap-3 md:justify-start">{workspaceTabsList}</div>
              </div>

              {!canReadChat && !canReadStorage ? (
                <div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-6 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <EyeOff className="h-12 w-12 opacity-50" />
                    <p className="text-base font-medium">У вас нет прав на просмотр содержимого</p>
                    <p className="text-sm text-muted-foreground">
                      Обратитесь к администратору спейса, чтобы получить доступ
                    </p>
                  </div>
                </div>
              ) : (
                // Both tabs share one grid cell; visited tabs stay mounted and the inactive one is only
                // made invisible, so switching is instant and keeps scroll position + the chat socket
                <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] md:px-6 md:pb-6">
                  <TabsContent
                    value="chat"
                    forceMount={isTabMounted("chat") || undefined}
                    className={workspaceContentClass}
                  >
                    <ChatTab spaceId={id} canWrite={canWriteChat} />
                  </TabsContent>

                  <TabsContent
                    value="storage"
                    forceMount={isTabMounted("storage") || undefined}
                    className={workspaceContentClass}
                  >
                    <StorageTab spaceId={id} canUpload={canUploadStorage} canDownload={canDownloadStorage} canDelete={canDeleteStorage}/>
                  </TabsContent>
                </div>
              )}
          </div>
        </div>

         <SpaceSettingsDrawer
           open={panel.active === "space-settings"}
           onClose={panel.close}
           id={id}
           currentSpaceName={currentSpace ? currentSpace.name : `Спейс #${id}`}
           currentSpaceAvatarUrl={currentSpace?.avatarUrl}
           spaceName={spaceName}
           setSpaceName={setSpaceName}
           isCreator={isCreator}
           canReadRoles={canReadRoles}
           canCreateRoles={canCreateRoles}
           canAssignRoles={canAssignRoles}
           canEditRoles={canEditRoles}
           canDeleteSpace={canDeleteSpace}
           canWriteSpace={canWriteSpace}
           canAddMember={canAddMember}
           canDeleteMember={canDeleteMember}
           onUpdateSpace={handleUpdateSpace}
           onDeleteSpace={handleDeleteSpace}
           isSaving={patchSpaceMutation.isPending}
            onNoPermissionSave={() => notify.error.forbidden()}
            onNoPermissionDelete={() => notify.error.forbidden()}
          />
          <ProfileRail />
      </div>
    </Tabs>
  );
}