import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RightDrawer } from "@/components/RightDrawer";
import { Loader2, Save, Trash2, X, LayoutGrid, Users, Shield } from "lucide-react";
import SpaceMembersPage from "@/pages/SpaceMembersPage";
import RolesTab from "@/components/role/RolesTab";
import RoleInfoPanel from "@/components/role/RoleInfoPanel";
import RoleEditorScreen from "@/components/role/RoleEditorScreen";
import { SpaceAvatarEditor } from "@/components/spaces/SpaceAvatarEditor";
import { cn } from "@/lib/utils";

import { usePanel, type SettingsTab } from "@/hooks/usePanel";

const sharedTabsListClass = "surface-panel-muted inline-flex h-auto gap-1 rounded-full p-1 text-muted-foreground";
const sharedTabsTriggerClass =
  "group inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-full px-3 max-md:w-10 max-md:px-0 text-sm font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground";
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
      <span className={sharedTabsLabelClass}>{label}</span>
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
  onUpdateSpace: () => void;
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
  const settingsTab = panel.state.settingsTab ?? "overview";
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
                <TabsContent value="overview" className="mt-0 flex-1 min-h-0 overflow-y-auto space-y-4">
                  <div className="space-y-8 px-1">
                    <div className="pb-4 pt-16">
                      <SpaceAvatarEditor
                        key={id}
                        spaceId={id}
                        name={currentSpaceName}
                        avatarUrl={currentSpaceAvatarUrl}
                        canEdit={canWriteSpace}
                        onNoPermission={onNoPermissionSave}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          id="spaceName"
                          value={spaceName}
                          onChange={(e) => setSpaceName(e.target.value)}
                          placeholder="Название спейса"
                          aria-label="Название спейса"
                          className="flex-1"
                          disabled={!canWriteSpace}
                        />
                        {canWriteSpace ? (
                          isSaving ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0}>
                                  <Button size="icon" disabled aria-label="Сохранение">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="left">Сохранение...</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={onUpdateSpace} size="icon" aria-label="Сохранить название">
                                  <Save className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Сохранить</TooltipContent>
                            </Tooltip>
                          )
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                className="opacity-50"
                                size="icon"
                                onClick={onNoPermissionSave}
                                aria-label="Сохранить название"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">Сохранить</TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className={cn(!canDeleteSpace && "opacity-50")}
                              onClick={canDeleteSpace ? onDeleteSpace : onNoPermissionDelete}
                              aria-label="Удалить спейс"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Удалить спейс</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="members" className="mt-0 flex-1 min-h-0 overflow-y-auto">
                  <SpaceMembersPage canAssign={canAssignRoles} canAdd={canAddMember} canDelete={canDeleteMember} />
                </TabsContent>

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
