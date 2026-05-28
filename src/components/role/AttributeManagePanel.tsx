import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CircleToggle } from "@/components/ui/circle-toggle";
import { ArrowLeft, CheckCheck } from "lucide-react";
import { ActionDto, ActionAttributeDto } from "@/types/api";
import { getRoleAttributeKey, RoleAttributeSelections } from "@/lib/role-attributes";

export interface ActiveAttribute {
  actionId: number;
  actionName: string;
  attr: ActionAttributeDto;
}

export default function AttributeManagePanel({
  actionId,
  actionName,
  attr,
  roles,
  actions,
  attributeValues,
  onToggle,
  onToggleAll,
  onBack,
}: {
  actionId: number;
  actionName: string;
  attr: ActionAttributeDto;
  roles: Array<{ id: number; name: string }>;
  actions: ActionDto[];
  attributeValues: RoleAttributeSelections;
  onToggle: (actionId: number, attrName: string, value: number) => void;
  onToggleAll: (actionId: number, attrName: string, itemIds: number[]) => void;
  onBack: () => void;
}) {
  const items = attr.name === "grantable_actions" ? actions : roles;
  const attrKey = getRoleAttributeKey(actionId, attr.name);
  const selectedSet = attributeValues[attrKey] || new Set<number>();
  const allSelected = items.length > 0 && items.every((item) => selectedSet.has(item.id));

  const handleToggleAll = () => {
    const ids = items.map((item) => item.id);
    onToggleAll(actionId, attr.name, ids);
  };

  return (
    <>
      <div className="surface-shell flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {actionName}
          </p>
          <h2 className="truncate text-lg font-semibold sm:text-xl">
            {attr.displayName}
          </h2>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-4 p-4 sm:p-6">
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={handleToggleAll}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {allSelected ? "Снять все" : "Выбрать все"}
            </Button>
          )}
          <div className="space-y-1">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/40"
              >
                <CircleToggle
                  id={`attr-${actionId}-${attr.name}-${item.id}`}
                  checked={attributeValues[getRoleAttributeKey(actionId, attr.name)]?.has(item.id) || false}
                  onCheckedChange={() => onToggle(actionId, attr.name, item.id)}
                />
                <Label
                  htmlFor={`attr-${actionId}-${attr.name}-${item.id}`}
                  className="cursor-pointer text-sm font-medium"
                >
                  {item.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Нет доступных элементов</p>
          )}
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
