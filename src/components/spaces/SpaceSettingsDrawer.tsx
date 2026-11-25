import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RightDrawer } from "@/components/RightDrawer";
import { X, LayoutGrid, Users, Shield, UserCheck } from "lucide-react";
import SpaceMembersPage from "@/pages/SpaceMembersPage";
import RolesTab from "@/components/role/RolesTab";
import RoleInfoPanel from "@/components/role/RoleInfoPanel";
import RoleEditorScreen from "@/components/role/RoleEditorScreen";
import { SpaceOverviewTab } from "@/components/spaces/SpaceOverviewTab";
import JoinRequestsTab from "@/components/join-requests/JoinRequestsTab";
import { useJoinRequests } from "@/hooks/useJoinRequests";

import { usePanel, type SettingsTab } from "@/hooks/usePanel";
import { cn } from "@/lib/utils";

const sharedTabsListClass = "surface-panel-muted inline-flex h-auto gap-1 rounded-full p-1 text-muted-foreground";
const sharedTabsTriggerClass =
  "group inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full px-3 max-md:w-10 max-md:px-0 text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground";
const sharedTabsLabelClass =
  "max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-24 group-hover:opacity-100 group-data-[state=active]:max-w-24 group-data-[state=active]:opacity-100 max-md:hidden";

const badgeClass =
  "flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold leading-none text-primary-foreground";

function WorkspaceTabsTrigger({
  value,
  icon: Icon,
  label,
  disabled,
  title,
  badge,
}: {
  value: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
  title?: string;
  /** Counter: on the icon's corner while collapsed, after the label when expanded; hidden when 0 */
  badge?: number;
}) {
  const showBadge = !!badge && badge > 0;
  const badgeText = badge && badge > 99 ? "99+" : badge;
  return (
    <TabsTrigger
      value={value}
      disabled={disabled}
      title={title}
      // The corner badge sits in the pill's rounded corner, so it must not be clipped
      className={cn(sharedTabsTriggerClass, showBadge && "overflow-visible")}
      aria-label={showBadge ? `${label}: ${badge}` : label}
    >
      <span className="relative flex shrink-0">
        <Icon className="h-4 w-4" />
        {showBadge && (
          // Collapsed tab: counter on the icon's corner. It fades out on desktop once the label
          // expands (hover / active), where the inline counter after the label takes over.
          <span
            aria-hidden
            className={cn(
              badgeClass,
              "absolute -right-2.5 -top-2 transition-opacity duration-200 md:group-hover:opacity-0 md:group-data-[state=active]:opacity-0"
            )}
          >
            {badgeText}
          </span>
        )}
      </span>
      <span className={cn(sharedTabsLabelClass, "inline-flex items-center gap-1.5")}>
        {label}
        {showBadge && (
          <span aria-hidden className={badgeClass}>
            {badgeText}
          </span>
        )}
      </span>
    </TabsTrigger>
  );
}

interface SpaceSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  id: number;
  currentSpaceName: string;
  currentSpaceAvatarUrl?: string | null;
  spaceName: string;
  setSpaceName: (value: string) => void;
  isCreator: boolean;
  canReadRoles: boolean;
  canCreateRoles: boolean;
  canAssignRoles: boolean;
  canEditRoles: boolean;
  canDeleteSpace: boolean;
  canWriteSpace: boolean;
  canAddMember: boolean;
  canDeleteMember: boolean;
  onUpdateSpace: (options?: { onSuccess?: () => void }) => void;
  onDeleteSpace: () => void;
  isSaving: boolean;
  onNoPermissionSave: () => void;
  onNoPermissionDelete: () => void;
}

export function SpaceSettingsDrawer({
  open,
  onClose,
  id,
  currentSpaceName,
  currentSpaceAvatarUrl,
  spaceName,
  setSpaceName,
  isCreator,
  canReadRoles,
  canCreateRoles,
  canAssignRoles,
  canEditRoles,
  canDeleteSpace,
  canWriteSpace,
  canAddMember,
  canDeleteMember,
  onUpdateSpace,
  onDeleteSpace,
  isSaving,
  onNoPermissionSave,
  onNoPermissionDelete,
}: SpaceSettingsDrawerProps) {
  // Tabs replace the history entry; role screens push one, so "back" walks out of them
  const panel = usePanel();
  // Same cache entry as the «Заявки» tab and the invite card, so this adds no extra requests
  const { data: joinRequestsData } = useJoinRequests(id, canAddMember && open);
  const pendingRequests = joinRequestsData?.pages[0]?.total ?? 0;
  const requestedTab = panel.state.settingsTab ?? "overview";
  // Invite link and join requests are only for members with space_user:ADD
  const settingsTab = requestedTab === "requests" && !canAddMember ? "overview" : requestedTab;
  const roleScreen = panel.state.roleScreen ?? { kind: "list" };

  const renderContent = () => {
    if (roleScreen.kind === "info") {
      return (
        <RoleInfoPanel
          spaceId={id}
          roleId={roleScreen.roleId}
          canEdit={canEditRoles}
          onBack={panel.back}
          onEdit={() => panel.push({ roleScreen: { kind: "editor", roleId: roleScreen.roleId, fromInfo: true } })}
        />
      );
    }

    if (roleScreen.kind === "editor") {
      return (
        <RoleEditorScreen
          spaceId={id}
          roleId={roleScreen.roleId}
          canEdit={canEditRoles}
          canCreate={canCreateRoles}
          onBack={panel.back}
          onDone={panel.back}
        />
      );
    }

    return (
      <>
        <Tabs
          value={settingsTab}
          onValueChange={(value) => panel.replace({ settingsTab: value as SettingsTab })}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="surface-shell relative flex items-center justify-center px-12 py-3 sm:px-14">
            <TabsList className={sharedTabsListClass}>
              <WorkspaceTabsTrigger value="overview" icon={LayoutGrid} label="Обзор" />
              <WorkspaceTabsTrigger value="members" icon={Users} label="Участники" />
              {canAddMember && (
                <WorkspaceTabsTrigger value="requests" icon={UserCheck} label="Заявки" badge={pendingRequests} />
              )}
              <WorkspaceTabsTrigger
                value="roles"
                icon={Shield}
                label="Роли"
                disabled={!canReadRoles}
                title={!canReadRoles ? "У вас нет прав на просмотр ролей" : undefined}
              />
            </TabsList>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Закрыть панель настроек"
                  className="absolute right-2 top-1/2 h-11 w-11 -translate-y-1/2 sm:right-4 sm:h-10 sm:w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Закрыть настройки</TooltipContent>
            </Tooltip>
          </div>

          <ScrollArea className="flex-1">
            <div className="pb-4 pl-4 pr-4 pt-0 sm:px-6 sm:pb-6">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <TabsContent value="overview" className="mt-0 flex-1 min-h-0 overflow-y-auto">
                  <SpaceOverviewTab
                    spaceId={id}
                    currentSpaceName={currentSpaceName}
                    currentSpaceAvatarUrl={currentSpaceAvatarUrl}
                    spaceName={spaceName}
                    setSpaceName={setSpaceName}
                    canWriteSpace={canWriteSpace}
                    canDeleteSpace={canDeleteSpace}
                    canAddMember={canAddMember}
                    isSaving={isSaving}
                    onUpdateSpace={onUpdateSpace}
                    onDeleteSpace={onDeleteSpace}
                    onNoPermissionSave={onNoPermissionSave}
                    onNoPermissionDelete={onNoPermissionDelete}
                    onOpenRequests={() => panel.replace({ settingsTab: "requests" })}
                  />
                </TabsContent>

                <TabsContent value="members" className="mt-0 flex-1 min-h-0 overflow-y-auto">
                  <SpaceMembersPage canAssign={canAssignRoles} canAdd={canAddMember} canDelete={canDeleteMember} />
                </TabsContent>

                {canAddMember && (
                  <TabsContent value="requests" className="mt-0 flex-1 min-h-0 overflow-y-auto">
                    <JoinRequestsTab spaceId={id} />
                  </TabsContent>
                )}

                <TabsContent value="roles" className="mt-0 flex-1 min-h-0 overflow-y-auto">
                  <RolesTab
                    spaceId={id}
                    isCreator={isCreator}
                    canCreate={canCreateRoles}
                    canRead={canReadRoles}
                    onSelectRole={(roleId) => panel.push({ roleScreen: { kind: "info", roleId } })}
                    onCreateRole={() => panel.push({ roleScreen: { kind: "editor" } })}
                  />
                </TabsContent>
              </div>
            </div>
          </ScrollArea>
        </Tabs>
      </>
    );
  };

  return (
    <RightDrawer open={open} onClose={onClose} id="space-settings-drawer" aria-label="Настройки спейса">
      {renderContent()}
    </RightDrawer>
  );
}
