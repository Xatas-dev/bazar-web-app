import { useState } from "react";
import { ActionDto } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionCategoryListProps {
  groupedActions: [string, ActionDto[]][];
  variant: "read" | "edit";
  grantedActionIds?: Set<number>;
  selectedActions?: Set<number>;
  isActionAllowed?: (actionId: number) => boolean;
  onToggleAction?: (actionId: number) => void;
  onGearClick?: (action: ActionDto, rect: DOMRect) => void;
}

export default function PermissionCategoryList({
  groupedActions,
  variant,
  grantedActionIds,
  selectedActions,
  isActionAllowed,
  onToggleAction,
  onGearClick,
}: PermissionCategoryListProps) {
  const firstResource = groupedActions[0]?.[0];
  const [open, setOpen] = useState<Set<string>>(() =>
    new Set(firstResource ? [firstResource] : [])
  );

  const toggleCategory = (resourceName: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(resourceName)) {
        next.delete(resourceName);
      } else {
        next.add(resourceName);
      }
      return next;
    });
  };

  if (groupedActions.length === 0) {
    return <p className="text-sm text-muted-foreground">Нет доступных разрешений</p>;
  }

  return (
    <div className="space-y-3">
      {groupedActions.map(([resourceName, actions]) => {
        const isOpen = open.has(resourceName);
        const grantedCount =
          variant === "read"
            ? actions.filter((a) => grantedActionIds?.has(a.id)).length
            : actions.filter((a) => selectedActions?.has(a.id)).length;

        return (
          <div key={resourceName} className="overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              onClick={() => toggleCategory(resourceName)}
              className="flex w-full items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-expanded={isOpen}
            >
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
              />
              <span className="flex-1 text-sm font-semibold">{resourceName}</span>
              <Badge variant="outline" className="text-[11px]">
                {grantedCount}/{actions.length}
              </Badge>
            </button>

            {isOpen && (
              <div className="space-y-1 border-t border-border p-2">
                {actions.map((action) => {
                  if (variant === "read") {
                    const granted = grantedActionIds?.has(action.id) ?? false;
                    return (
                      <div
                        key={action.id}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm",
                          granted ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <span className="flex-1">{action.name}</span>
                      </div>
                    );
                  }

                  const allowed = isActionAllowed ? isActionAllowed(action.id) : true;
                  const selected = selectedActions?.has(action.id) ?? false;
                  const row = (
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                        allowed ? "hover:bg-accent/40" : "opacity-[var(--panel-disabled-opacity)]"
                      )}
                    >
                      <Checkbox
                        id={`perm-action-${action.id}`}
                        checked={selected}
                        disabled={!allowed}
                        onCheckedChange={() => onToggleAction?.(action.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`perm-action-${action.id}`}
                            className="cursor-pointer text-sm font-medium"
                          >
                            {action.name}
                          </Label>
                          {action.attributes.length > 0 && onGearClick && (
                            <button
                              type="button"
                              disabled={!selected}
                              onClick={(e) =>
                                onGearClick(action, (e.currentTarget as HTMLElement).getBoundingClientRect())
                              }
                              className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                            >
                              <Settings2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  if (!allowed) {
                    return (
                      <Tooltip key={action.id}>
                        <TooltipTrigger asChild>{row}</TooltipTrigger>
                        <TooltipContent>В вашей текущей роли нет данного права</TooltipContent>
                      </Tooltip>
                    );
                  }
                  return <div key={action.id}>{row}</div>;
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
