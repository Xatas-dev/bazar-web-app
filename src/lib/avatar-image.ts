import type { Area } from 'react-easy-crop';

/** Side of the square avatar we upload (largest on-screen avatar is ~290px, in settings). */
export const AVATAR_OUTPUT_SIZE = 512;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image could not be decoded'));
    img.src = src;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Crops `area` (in source pixels) out of the image and scales it to a square of at most
 * AVATAR_OUTPUT_SIZE (never upscales). Encodes WebP, falling back to PNG where the browser
 * can't encode WebP; both keep transparency for logos.
 */
export async function cropAvatarImage(src: string, area: Area): Promise<File> {
  const img = await loadImage(src);
  const size = Math.max(1, Math.round(Math.min(AVATAR_OUTPUT_SIZE, area.width, area.height)));

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);

  let blob = await canvasToBlob(canvas, 'image/webp', 0.9);
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasToBlob(canvas, 'image/png');
  }
  if (!blob) throw new Error('Canvas could not be encoded');

  const extension = blob.type === 'image/webp' ? 'webp' : 'png';
  return new File([blob], `avatar.${extension}`, { type: blob.type });
}
