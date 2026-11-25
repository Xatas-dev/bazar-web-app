import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, Loader2, Pencil, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SpaceAvatarEditor } from "@/components/spaces/SpaceAvatarEditor";
import { SpaceInviteLink } from "@/components/spaces/SpaceInviteLink";
import { useSpaceUsers } from "@/hooks/useSpaces";
import { cn } from "@/lib/utils";

const chipClass =
  "inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-surface-muted))] px-3 py-1 text-xs font-medium text-muted-foreground";

const pluralMembers = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "участник";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "участника";
  return "участников";
};

const fade = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.15, ease: "easeOut" },
} as const;

interface SpaceOverviewTabProps {
  spaceId: number;
  currentSpaceName: string;
  currentSpaceAvatarUrl?: string | null;
  spaceName: string;
  setSpaceName: (value: string) => void;
  canWriteSpace: boolean;
  canDeleteSpace: boolean;
  canAddMember: boolean;
  isSaving: boolean;
  onUpdateSpace: (options?: { onSuccess?: () => void }) => void;
  onDeleteSpace: () => void;
  onNoPermissionSave: () => void;
  onNoPermissionDelete: () => void;
  onOpenRequests: () => void;
}

export function SpaceOverviewTab({
  spaceId,
  currentSpaceName,
  currentSpaceAvatarUrl,
  spaceName,
  setSpaceName,
  canWriteSpace,
  canDeleteSpace,
  canAddMember,
  isSaving,
  onUpdateSpace,
  onDeleteSpace,
  onNoPermissionSave,
  onNoPermissionDelete,
  onOpenRequests,
}: SpaceOverviewTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: usersData } = useSpaceUsers(spaceId);
  const memberCount = usersData?.users.length;

  // Leaving the space (or losing the permission) drops edit mode
  useEffect(() => {
    setIsEditing(false);
  }, [spaceId, canWriteSpace]);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const startEditing = () => {
    if (!canWriteSpace) {
      onNoPermissionSave();
      return;
    }
    setSpaceName(currentSpaceName);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setSpaceName(currentSpaceName);
    setIsEditing(false);
  };

  const save = () => {
    if (spaceName.trim() === currentSpaceName) {
      setIsEditing(false);
      return;
    }
    onUpdateSpace({ onSuccess: () => setIsEditing(false) });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancelEditing();
    }
  };

  return (
    <div className="space-y-6 px-1">
      {/* Hero: avatar + name */}
      <div className="space-y-5 pb-2 pt-16">
        <SpaceAvatarEditor
          key={spaceId}
          spaceId={spaceId}
          name={currentSpaceName}
          avatarUrl={currentSpaceAvatarUrl}
          canEdit={canWriteSpace}
          onNoPermission={onNoPermissionSave}
        />

        <div className="flex min-h-12 items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {isEditing ? (
              <motion.div key="edit" {...fade} className="flex w-full max-w-sm items-center gap-2">
                <input
                  ref={inputRef}
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  placeholder="Название спейса"
                  aria-label="Название спейса"
                  className="min-w-0 flex-1 border-b-2 border-primary bg-transparent pb-1 text-center text-2xl font-extrabold tracking-tight text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:opacity-50"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={cancelEditing}
                      disabled={isSaving}
                      aria-label="Отменить изменение названия"
                      className="shrink-0 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Отмена</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={save}
                      disabled={isSaving}
                      aria-label="Сохранить название"
                      className="shrink-0 rounded-full"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Сохранить</TooltipContent>
                </Tooltip>
              </motion.div>
            ) : (
              <motion.div key="view" {...fade} className="group flex max-w-full items-center gap-1">
                <h2 className="min-w-0 break-words text-center text-2xl font-extrabold tracking-tight">
                  {currentSpaceName}
                </h2>
                {canWriteSpace && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={startEditing}
                        aria-label="Изменить название спейса"
                        className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Изменить название</TooltipContent>
                  </Tooltip>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {memberCount !== undefined && (
            <span className={chipClass}>
              <Users className="h-3.5 w-3.5" />
              {memberCount} {pluralMembers(memberCount)}
            </span>
          )}
          {!canWriteSpace && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className={cn(chipClass, "cursor-default select-none")}>
                  <Eye className="h-3.5 w-3.5" />
                  Только просмотр
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-64">
                Изменять название и аватар могут только участники с правом редактировать спейс.
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <SpaceInviteLink spaceId={spaceId} canInvite={canAddMember} onOpenRequests={onOpenRequests} />

      {/* Danger zone */}
      <section
        className="surface-panel flex items-center gap-3 rounded-lg border-destructive/30 p-4"
        aria-labelledby="space-danger-title"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Trash2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 id="space-danger-title" className="font-semibold">
            Удалить спейс
          </h3>
          <p className="text-sm text-muted-foreground">Чат, файлы и роли будут удалены навсегда.</p>
        </div>
        {canDeleteSpace ? (
          <Button variant="destructive" size="sm" onClick={onDeleteSpace} className="shrink-0">
            Удалить
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={onNoPermissionDelete}
                className="shrink-0 opacity-50"
                aria-label="Удалить спейс: нет прав"
              >
                Удалить
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Нет прав на удаление спейса</TooltipContent>
          </Tooltip>
        )}
      </section>
    </div>
  );
}
