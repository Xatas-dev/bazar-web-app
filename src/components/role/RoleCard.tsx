import { RoleDto, ActionDto } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";

interface RoleCardProps {
  role: RoleDto;
  spaceId: number;
  availableActions: ActionDto[];
  hideMeta?: boolean;
}

export default function RoleCard({ role, hideMeta = false }: RoleCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{role.name || 'Без названия'}</CardTitle>
            {!hideMeta && (
              <p className="text-xs text-muted-foreground">
                Создана: {role.createdBy} • ID: {role.id}
              </p>
            )}
          </div>
          <Badge variant={role.isVisible ? "default" : "secondary"} className="ml-2">
            {role.isVisible ? (
              <Eye className="h-3 w-3 mr-1" />
            ) : (
              <EyeOff className="h-3 w-3 mr-1" />
            )}
            {role.isVisible ? 'Видима' : 'Скрыта'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Разрешения ({role.actions?.length || 0})</h4>
            {(role.actions && role.actions.length > 0) ? (
              <div className="flex flex-wrap gap-2">
                {role.actions.map((action: ActionDto) => (
                  <Badge
                    key={action.id}
                    variant="outline"
                    className="text-xs"
                    title={`${action.resource}:${action.code}`}
                  >
                    {action.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Нет разрешений</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

