import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SpaceAvatar } from "@/components/spaces/SpaceAvatar";
import { AvatarCropper } from "@/components/AvatarCropper";
import { toast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";
import { notify } from "@/lib/notifications";
import { AvatarUploadError } from "@/lib/avatar-upload";
import { cn } from "@/lib/utils";

interface AvatarEditorProps {
  /** Used for the initials fallback and alt text */
  name: string;
  avatarUrl?: string | null;
  /** Uploads the picked file; resolves once the new avatar is ready */
  upload: (file: File) => Promise<unknown>;
  isUploading: boolean;
  /** aria-label of the pencil button */
  editLabel: string;
  successDescription: string;
  canEdit?: boolean;
  onNoPermission?: () => void;
}

/**
 * Large glowing squircle avatar with a pencil button, local preview, upload spinner and inline errors.
 * Shared by space settings and the profile edit panel. Takes half of the available width.
 */
export function AvatarEditor({
  name,
  avatarUrl,
  upload,
  isUploading,
  editLabel,
  successDescription,
  canEdit = true,
  onNoPermission,
}: AvatarEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  /** Object URL of the picked original; while set, the inline cropper replaces the avatar */
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // Release the local preview object URL when it is replaced or the editor unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  const handleEditClick = () => {
    if (!canEdit) {
      onNoPermission?.();
      return;
    }
    fileInputRef.current?.click();
  };

  // 1. Pick a file → show the inline cropper with the original
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error.generic("Выберите файл изображения.");
      return;
    }
    setCropSrc(URL.createObjectURL(file));
  };

  // 2. Crop confirmed → upload the processed square image
  const handleCropped = async (file: File) => {
    setCropSrc(null);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      await upload(file);
      toast({ title: "Аватар обновлён", description: successDescription });
    } catch (error) {
      // Axios errors already got a toast from the global interceptor
      if (!isAxiosError(error)) {
        notify.error.generic(
          error instanceof AvatarUploadError ? error.message : "Не удалось загрузить аватар. Попробуйте ещё раз."
        );
      }
    } finally {
      setPreviewUrl(null);
    }
  };

  if (cropSrc) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-1/2">
          <AvatarCropper imageSrc={cropSrc} onCancel={() => setCropSrc(null)} onConfirm={handleCropped} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-1/2">
        <SpaceAvatar
          name={name}
          avatarUrl={previewUrl ?? avatarUrl}
          className="aspect-square h-auto w-full"
          shape="squircle"
          fallbackClassName="text-6xl sm:text-7xl"
          glow
          glowClassName="scale-110 opacity-70 blur-xl"
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[var(--space-avatar-radius)] bg-[hsl(var(--panel-overlay))]">
            <Loader2 className="h-12 w-12 animate-spin text-primary-foreground" />
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
          aria-hidden
          tabIndex={-1}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleEditClick}
              disabled={isUploading}
              aria-label={editLabel}
              className={cn(
                "absolute bottom-1 right-1 h-12 w-12 rounded-full border border-border bg-background hover:bg-accent",
                !canEdit && "opacity-50"
              )}
            >
              <Pencil className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Изменить аватар</TooltipContent>
        </Tooltip>
      </div>

      {isUploading ? (
        <p className="text-sm text-muted-foreground">Загружаем и обрабатываем изображение…</p>
      ) : null}
    </div>
  );
}
