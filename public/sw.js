const buildTargetUrl = (spaceId, messageId) => {
  const path = `/spaces/${spaceId}`;
  const url = new URL(path, self.location.origin);
  if (typeof messageId !== 'undefined' && messageId !== null) {
    url.searchParams.set('messageId', String(messageId));
  }
  url.searchParams.set('tab', 'chat');
  return url.toString();
};

const getInitials = (firstName, lastName) => {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return initials.length === 2 ? initials : '??';
};

/**
 * Генерирует аватарку как SVG Data URL
 * Серый кружок с белыми инициалами (как в чате и телеграмме)
 */
const generateAvatarDataUrl = (firstName, lastName) => {
  const initials = getInitials(firstName, lastName);
  const size = 96;

  // SVG с кружком и инициалами
  // Экранируем инициалы для безопасности в XML
  const escapedInitials = initials
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#E5E7EB"/><text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="middle" font-size="${size * 0.4}" font-weight="bold" fill="white" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${escapedInitials}</text></svg>`;

  // Кодируем SVG правильным способом
  // Используем encodeURIComponent вместо btoa для поддержки Unicode символов
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return dataUrl;
};

self.addEventListener('push', (event) => {
  let payload = null;

  try {
    payload = event.data ? event.data.json() : null;
    console.log('[WebPush][SW] push event received', payload);
  } catch (error) {
    console.error('[WebPush][SW] Failed to parse push payload', error);
  }

  if (!payload) {
    console.warn('[WebPush][SW] Empty push payload, ignoring');
    return;
  }

  // Проверяем разрешение на уведомления
  if (Notification.permission !== 'granted') {
    console.warn('[WebPush][SW] Notification permission not granted, skipping notification');
    return;
  }

  // Старый формат
  if (typeof payload.title === 'string' && typeof payload.body === 'string') {
    const spaceId = typeof payload.spaceId === 'number' ? payload.spaceId : null;
    const messageId = typeof payload.messageId === 'number' ? payload.messageId : null;

    const data = (spaceId !== null) ? { spaceId, messageId: messageId !== null ? messageId : undefined } : undefined;

    event.waitUntil(
      self.registration.showNotification(payload.title, {
        body: payload.body,
        data,
      }),
    );

    return;
  }

  // Новый формат { author, content, optional spaceId, messageId }
  if (payload.author && typeof payload.content === 'string') {
    const first = payload.author.firstName || '';
    const last = payload.author.lastName || '';
    const authorName = [first, last].map(s => s.trim()).filter(Boolean).join(' ') || 'New message';
    const avatarDataUrl = generateAvatarDataUrl(first, last);
    const body = payload.content;
    const spaceId = typeof payload.spaceId === 'number' ? payload.spaceId : null;
    const messageId = typeof payload.messageId === 'number' ? payload.messageId : null;

    const data = (spaceId !== null) ? { spaceId, messageId: messageId !== null ? messageId : undefined } : undefined;

    event.waitUntil(
      self.registration.showNotification(authorName, {
        body,
        data,
        icon: avatarDataUrl,
        badge: avatarDataUrl,
        tag: `chat-${spaceId}`,
        requireInteraction: false,
      }),
    );

    return;
  }

  console.warn('[WebPush][SW] Unknown push payload format', payload);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[WebPush][SW] notificationclick', event.notification && event.notification.data);
  event.notification.close();

  const data = event.notification.data || {};
  const spaceId = typeof data.spaceId === 'number' ? data.spaceId : null;
  const messageId = typeof data.messageId === 'number' ? data.messageId : null;

  if (spaceId === null) {
    // Нет данных для навигации — просто фокусируем приложение
    event.waitUntil((async () => {
      const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existingClient = windowClients.find((client) => client.url.startsWith(self.location.origin));
      if (existingClient) {
        await existingClient.focus();
      } else {
        await self.clients.openWindow(self.location.origin);
      }
    })());

    return;
  }

  event.waitUntil((async () => {
    const targetUrl = buildTargetUrl(spaceId, messageId);
    const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

    const existingClient = windowClients.find((client) => client.url.startsWith(self.location.origin));

    if (existingClient) {
      await existingClient.focus();
      if ('navigate' in existingClient) {
        await existingClient.navigate(targetUrl);
      }
      return;
    }

    await self.clients.openWindow(targetUrl);
  })());
});

/**
 * Обработчик сообщений от приложения
 * Позволяет приложению отправить команду skipWaiting для активации нового SW
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message, activating new service worker');
    self.skipWaiting();
  }
});
