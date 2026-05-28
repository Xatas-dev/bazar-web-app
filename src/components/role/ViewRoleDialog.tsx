import { useGetRole } from "@/hooks/useRoles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardContent } from "@/components/ui/card";
import RoleCard from "./RoleCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ViewRoleDialogProps {
  spaceId: number;
  roleId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hideMeta?: boolean;
}

export default function ViewRoleDialog({ spaceId, roleId, isOpen, onOpenChange, hideMeta = false }: ViewRoleDialogProps) {
  const { data: role, isLoading } = useGetRole(spaceId, roleId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Просмотр роли</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
        ) : (
          <CardContent>
            {role ? <RoleCard role={role} spaceId={spaceId} availableActions={role.actions || []} hideMeta={hideMeta} /> : <div>Role not found</div>}
          </CardContent>
        )}
      </DialogContent>
    </Dialog>
  );
}

