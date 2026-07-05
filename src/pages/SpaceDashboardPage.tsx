import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteSpace, usePatchSpace, useSpaces } from "@/hooks/useSpaces";
import { useUser } from "@/hooks/useUser";
import { useSidebarStore } from "@/store/sidebarStore";
import { useGetRole, useGetUserRoles } from "@/hooks/useRoles";
import { Box, HardDrive, MessageSquare, Settings2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatTab } from "@/components/chat/ChatTab";
import { StorageTab, StorageUploadButton } from "@/components/storage/StorageTab";
import { getGrantableActionIds, getPermissionKey, SPACE_PERMISSIONS } from "@/lib/permissions";
import { ProfileRail } from "@/components/ProfileRail";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/lib/notifications";
import { SpaceSettingsDrawer } from "@/components/spaces/SpaceSettingsDrawer";
import type { SettingsTab } from "@/components/spaces/SpaceSettingsDrawer";

const sharedTabsListClass = "surface-panel-muted inline-flex h-auto gap-1 rounded-full p-1 text-muted-foreground";
const sharedTabsTriggerClass =
  "group inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground";
const sharedTabsLabelClass =
  "max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-24 group-hover:opacity-100 group-data-[state=active]:max-w-24 group-data-[state=active]:opacity-100";

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
      <span className={sharedTabsLabelClass}>{label}</span>
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

  const isCreator = !!userRolesResponse?.roles?.some((r: any) => r.isCreator === true);
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

  const createGrantableActionIds = isCreator
      ? null
      : getGrantableActionIds(assignedRole?.actions, SPACE_PERMISSIONS.rolesCreate);
  const editGrantableActionIds = isCreator
      ? null
      : getGrantableActionIds(assignedRole?.actions, SPACE_PERMISSIONS.rolesEdit);

  const deleteSpaceMutation = useDeleteSpace();
  const patchSpaceMutation = usePatchSpace();
  const { data: spacesData, isLoading: isSpacesLoading } = useSpaces();
  const navigate = useNavigate();

  const currentSpace = spacesData?.spaces.find((s) => s.id === id);
  const [spaceName, setSpaceName] = useState("");
  const [workspaceTab, setWorkspaceTab] = useState<"chat" | "storage">("chat");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("overview");
  const active = useSidebarStore((s) => s.active);
  const setActive = useSidebarStore((s) => s.setActive);
  const panel = useSidebarStore((s) => s.panel);
  const panelMeta = useSidebarStore((s) => s.panelMeta);
  const setPanel = useSidebarStore((s) => s.setPanel);

  useEffect(() => {
    if (currentSpace) {
      setSpaceName(currentSpace.name);
    }
  }, [currentSpace]);

  useEffect(() => {
    setWorkspaceTab("chat");
  }, [id]);

  useEffect(() => {
    const permissionsResolved = isCreator || !!assignedRole;
    if (userRolesResponse && permissionsResolved && !canReadChat && workspaceTab === "chat") {
      setWorkspaceTab("storage");
    }
  }, [canReadChat, workspaceTab, userRolesResponse, isCreator, assignedRole]);

  useEffect(() => {
    if (active !== 'space-settings') {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  const handleDeleteSpace = () => {
    if (confirm("Вы уверены, что хотите удалить этот спейс?")) {
      deleteSpaceMutation.mutate(id, {
        onSuccess: () => {
          navigate("/spaces");
        },
      });
    }
  };

  const handleUpdateSpace = () => {
    if (!spaceName.trim()) {
      notify.error.validation("Название спейса обязательно.");
      return;
    }

    patchSpaceMutation.mutate(
        { spaceId: id, name: spaceName },
        {
          onSuccess: () => {
          },
        }
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-clip">
      <div className="surface-shell relative z-20 flex-shrink-0 border-b border-border px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setActive('space-settings')}
            className="group flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-expanded={active === 'space-settings'}
            aria-controls="space-settings-drawer"
            title="Открыть настройки спейса"
          >
            <Box className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6" />
            <h1 className="truncate text-xl font-bold sm:text-2xl">
              <AnimatePresence mode="wait">
                <motion.span
                  key={id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isSpacesLoading ? (
                    <Skeleton className="h-7 w-48 sm:h-8 sm:w-56" />
                  ) : currentSpace ? (
                    currentSpace.name
                  ) : (
                    `Спейс #${id}`
                  )}
                </motion.span>
              </AnimatePresence>
            </h1>
            <Settings2 className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-stretch overflow-clip">
        <div className="flex min-h-0 flex-1 flex-col overflow-clip">
          <Tabs value={workspaceTab} onValueChange={(value) => setWorkspaceTab(value as "chat" | "storage")} className="flex min-h-0 flex-1 flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="relative z-20 flex-shrink-0 px-2 pb-3 sm:px-4">
                  <div className="relative flex items-center gap-3 pr-24 sm:pr-32">
                    <TabsList className={sharedTabsListClass}>
                      <WorkspaceTabsTrigger
                        value="chat"
                        icon={MessageSquare}
                        label="Чат"
                        disabled={!canReadChat}
                        title={!canReadChat ? "У вас нет прав на просмотр чата" : "Чат"}
                      />
                      <WorkspaceTabsTrigger value="storage" icon={HardDrive} label="Сторадж" title="Сторадж" />
                    </TabsList>

                    {workspaceTab === "storage" && (
                      <div className="absolute right-12 top-2 flex items-start">
                        <StorageUploadButton spaceId={id} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 sm:px-6 sm:pb-6">
                  <TabsContent value="chat" className="mt-0 flex-1 min-h-0 overflow-visible">
                    <ChatTab spaceId={id} canWrite={canWriteChat} />
                  </TabsContent>

                  <TabsContent value="storage" className="mt-0 flex-1 min-h-0 overflow-visible">
                    <StorageTab spaceId={id} />
                  </TabsContent>
                </div>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>

        <SpaceSettingsDrawer
          open={active === 'space-settings'}
          onClose={() => setActive(null)}
          id={id}
          currentSpaceName={currentSpace ? currentSpace.name : `Спейс #${id}`}
          spaceName={spaceName}
          setSpaceName={setSpaceName}
          settingsTab={settingsTab}
          setSettingsTab={setSettingsTab}
          canReadRoles={canReadRoles}
          canCreateRoles={canCreateRoles}
          canAssignRoles={canAssignRoles}
          canEditRoles={canEditRoles}
          canDeleteSpace={canDeleteSpace}
          canWriteSpace={canWriteSpace}
          canAddMember={canAddMember}
          canDeleteMember={canDeleteMember}
          createGrantableActionIds={createGrantableActionIds}
          editGrantableActionIds={editGrantableActionIds}
          onUpdateSpace={handleUpdateSpace}
          onDeleteSpace={handleDeleteSpace}
          isSaving={patchSpaceMutation.isPending}
          onNoPermissionSave={() => notify.error.forbidden()}
          onNoPermissionDelete={() => notify.error.forbidden()}
          panel={active === 'space-settings' ? panel : null}
          panelMeta={panelMeta}
          onPanelChange={setPanel}
        />
        <ProfileRail />
      </div>
    </div>
  );
}