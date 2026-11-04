import { useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { useUpdateAvatar } from "@/hooks/useUser";
import { toast } from "@/hooks/use-toast";
import type { UserDtoResponseV2 } from "@/types/api";

interface ProfileAvatarProps {
  user: UserDtoResponseV2;
  className?: string;
  editable?: boolean;
}

export function ProfileAvatar({ user, className, editable = false }: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const updateAvatarMutation = useUpdateAvatar();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.currentTarget.value = "";

    try {
      await updateAvatarMutation.mutateAsync(file);
      toast({ title: "Фотография обновлена", description: "Новая фотография профиля сохранена." });
    } catch {
      // Errors are surfaced via the global axios interceptor / notify
    }
  };

  return (
    <div className="relative shrink-0">
      <Avatar className={className}>
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.displayName} /> : null}
        <AvatarFallback>{user.displayName?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
      </Avatar>
      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelected}
            aria-hidden
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border border-border bg-background shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={updateAvatarMutation.isPending}
            aria-label="Изменить фотографию профиля"
          >
            {updateAvatarMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </Button>
        </>
      )}
    </div>
  );
}