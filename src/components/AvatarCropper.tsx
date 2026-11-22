import { useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cropAvatarImage } from "@/lib/avatar-image";
import { notify } from "@/lib/notifications";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

interface AvatarCropperProps {
  /** Object URL of the picked original */
  imageSrc: string;
  onCancel: () => void;
  /** Receives the square image (≤ 512×512) ready for upload */
  onConfirm: (file: File) => void;
}

/** Inline square cropper that takes the avatar's place in the editor; uploads the dragged/zoomed selection. */
export function AvatarCropper({ imageSrc, onCancel, onConfirm }: AvatarCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const process = async (makeFile: () => Promise<File>) => {
    setIsProcessing(true);
    try {
      onConfirm(await makeFile());
    } catch {
      setIsProcessing(false);
      notify.error.generic("Не удалось обработать изображение. Попробуйте другой файл.");
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-[var(--space-avatar-radius)] bg-muted">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          aspect={1}
          // Fill the square so the selection is the whole box; drag to pan wide/tall images
          objectFit="cover"
          showGrid={false}
          // The rounded box is the frame: drop the library's raw white border and dimming shadow
          classes={{ cropAreaClassName: "!border-0 !shadow-none" }}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setAreaPixels(pixels)}
          mediaProps={{
            // Nothing to crop (e.g. HEIC in Chrome): tell the user and leave crop mode
            onError: () => {
              notify.error.generic("Не удалось открыть изображение. Попробуйте файл JPG, PNG или WEBP.");
              onCancel();
            },
          }}
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--panel-overlay))]">
            <Loader2 className="h-12 w-12 animate-spin text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="flex w-full items-center gap-3">
        <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          disabled={isProcessing}
          aria-label="Масштаб"
          className="h-1.5 flex-1 cursor-pointer accent-primary"
        />
        <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>

      {/* Equal-width actions spanning the cropper width */}
      <div className="grid w-full grid-cols-2 gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={isProcessing}>
          Отмена
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => areaPixels && process(() => cropAvatarImage(imageSrc, areaPixels))}
          disabled={isProcessing || !areaPixels}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
}
