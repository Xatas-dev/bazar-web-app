import { useGetRole } from "@/hooks/useRoles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardContent } from "@/components/ui/card";
import RoleCard from "./RoleCard";
import { Loader2 } from "lucide-react";

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
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
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

