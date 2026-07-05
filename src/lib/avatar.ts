/**
 * Генерирует Data URL изображения аватарки с инициалами
 * Возвращает серый кружок с белыми инициалами (как в чате и телеграмме)
 */
export function generateAvatarDataUrl(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  size: number = 96
): string {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;

  if (!canvas) {
    // Fallback для окружений без DOM (например, Service Worker)
    return '';
  }

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  // Серый фон (как в чате)
  ctx.fillStyle = '#E5E7EB'; // gray-200
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Белые инициалы
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '??';

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${size * 0.4}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size / 2, size / 2);

  return canvas.toDataURL('image/png');
}

/**
 * Генерирует аватарку для Service Worker (используется в push-уведомлениях)
 * Размер: 96x96 пиксель для оптимальной производительности
 */
export function generateAvatarForPush(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  return generateAvatarDataUrl(firstName, lastName, 96);
}

