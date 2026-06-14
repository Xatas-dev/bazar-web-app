import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Save, Trash2, X, LayoutGrid, Users, Shield } from "lucide-react";
import SpaceMembersPage from "@/pages/SpaceMembersPage";
import RolesTab from "@/components/role/RolesTab";
import CreateRolePanel from "@/components/role/CreateRoleDialog";
import EditRolePanel from "@/components/role/EditRolePanel";
import RoleInfoPanel from "@/components/role/RoleInfoPanel";

type SettingsTab = "overview" | "members" | "roles";

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

export type { SettingsTab };

interface SpaceSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  id: number;
  currentSpaceName: string;
  spaceName: string;
  setSpaceName: (value: string) => void;
  settingsTab: SettingsTab;
  setSettingsTab: (value: SettingsTab) => void;
  canReadRoles: boolean;
  canCreateRoles: boolean;
  canAssignRoles: boolean;
  canEditRoles: boolean;
  canDeleteSpace: boolean;
  canWriteSpace: boolean;
  canAddMember: boolean;
  canDeleteMember: boolean;
  createGrantableActionIds: number[] | null;
  editGrantableActionIds: number[] | null;
  onUpdateSpace: () => void;
  onDeleteSpace: () => void;
  isSaving: boolean;
  onNoPermissionSave: () => void;
  onNoPermissionDelete: () => void;
  panel: string | null;
  panelMeta: Record<string, unknown>;
  onPanelChange: (panel: string | null, meta?: Record<string, unknown>) => void;
}

export function SpaceSettingsDrawer({
  open,
  onClose,
  id,
  currentSpaceName,
  spaceName,
  setSpaceName,
  settingsTab,
  setSettingsTab,
  canReadRoles,
  canCreateRoles,
  canAssignRoles,
  canEditRoles,
  canDeleteSpace,
  canWriteSpace,
  canAddMember,
  canDeleteMember,
  createGrantableActionIds,
  editGrantableActionIds,
  onUpdateSpace,
  onDeleteSpace,
  isSaving,
  onNoPermissionSave,
  onNoPermissionDelete,
  panel,
  panelMeta,
  onPanelChange,
}: SpaceSettingsDrawerProps) {
  const renderContent = () => {
    if (panel === 'create-role') {
      return (
        <CreateRolePanel
          spaceId={id}
          allowedActionIds={createGrantableActionIds}
          onBack={() => onPanelChange(null)}
        />
      );
    }

    if (panel === 'edit-role') {
      const roleId = panelMeta.roleId as number | undefined;
      if (!roleId) return null;
      return (
        <EditRolePanel
          spaceId={id}
          roleId={roleId}
          allowedActionIds={editGrantableActionIds}
          onBack={() => onPanelChange(null)}
        />
      );
    }

    if (panel === 'role-info') {
      const roleId = panelMeta.roleId as number | undefined;
      if (!roleId) return null;
      return (
        <RoleInfoPanel
          spaceId={id}
          roleId={roleId}
          onBack={() => onPanelChange(null)}
        />
      );
    }

    return (
      <>
        <div className="surface-shell flex items-start justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Space settings
            </p>
            <h2 id="space-settings-title" className="truncate text-lg font-semibold sm:text-xl">
              Manage {currentSpaceName}
            </h2>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings panel">
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Close settings</TooltipContent>
          </Tooltip>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-4 p-4 sm:p-6">
            <Tabs value={settingsTab} onValueChange={(value) => setSettingsTab(value as SettingsTab)} className="flex min-h-0 flex-col">
              <div className="flex justify-center px-1 pb-2">
                <TabsList className={sharedTabsListClass}>
                  <WorkspaceTabsTrigger value="overview" icon={LayoutGrid} label="Overview" />
                  <WorkspaceTabsTrigger value="members" icon={Users} label="Members" />
                  <WorkspaceTabsTrigger
                    value="roles"
                    icon={Shield}
                    label="Roles"
                    disabled={!canReadRoles}
                    title={!canReadRoles ? "You don't have permission to view roles" : undefined}
                  />
                </TabsList>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <TabsContent value="overview" className="mt-0 flex-1 min-h-0 overflow-y-auto space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold sm:text-xl">Space Settings</h3>
                      <p className="text-sm text-muted-foreground">Manage your space configuration.</p>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="spaceName">Space Name</Label>
                      <div className="flex flex-col gap-2 sm:flex-row px-1">
                        <Input
                          id="spaceName"
                          value={spaceName}
                          onChange={(e) => setSpaceName(e.target.value)}
                          className="flex-1"
                          disabled={!canWriteSpace}
                        />
                        {canWriteSpace ? (
                          isSaving ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span tabIndex={0}>
                                  <Button size="icon" disabled>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="left">Saving...</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={onUpdateSpace} size="icon">
                                  <Save className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Save</TooltipContent>
                            </Tooltip>
                          )
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button className="opacity-50" size="icon" onClick={onNoPermissionSave}>
                                <Save className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">Save</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    <div className="surface-panel-muted mt-8 flex flex-col justify-between gap-4 rounded-lg p-4 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="font-medium text-destructive">Delete Space</h3>
                        <p className="text-sm text-muted-foreground">
                          Permanently remove this space and all its data.
                        </p>
                      </div>
                      {canDeleteSpace ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="destructive" size="icon" onClick={onDeleteSpace}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Delete Space</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="opacity-50"
                              onClick={onNoPermissionDelete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Delete Space</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="members" className="mt-0 flex-1 min-h-0 overflow-y-auto">
                  <SpaceMembersPage canAssign={canAssignRoles} canAdd={canAddMember} canDelete={canDeleteMember} />
                </TabsContent>

                <TabsContent value="roles" className="mt-0 flex-1 min-h-0 overflow-y-auto">
                  <RolesTab
                    spaceId={id}
                    canCreate={canCreateRoles}
                    canEdit={canEditRoles}
                    canRead={canReadRoles}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </ScrollArea>
      </>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.aside
          key={panel ?? "settings"}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "40rem", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          id="space-settings-drawer"
          role="complementary"
          aria-labelledby="space-settings-title"
          className="surface-shell flex h-full shrink-0 flex-col border-l border-border overflow-hidden"
          style={{ maxWidth: "var(--right-sidebar-width)" }}
        >
          {renderContent()}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
