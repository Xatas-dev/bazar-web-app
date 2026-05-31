const buildTargetUrl = (chatId, messageId) => {
  const url = new URL('/spaces', self.location.origin);
  url.searchParams.set('chatId', String(chatId));
  url.searchParams.set('messageId', String(messageId));
  url.searchParams.set('tab', 'chat');
  return url.toString();
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

  // Старый формат
  if (typeof payload.title === 'string' && typeof payload.body === 'string') {
    const chatId = typeof payload.chatId === 'number' ? payload.chatId : null;
    const messageId = typeof payload.messageId === 'number' ? payload.messageId : null;

    event.waitUntil(
      self.registration.showNotification(payload.title, {
        body: payload.body,
        data: chatId !== null && messageId !== null ? { chatId, messageId } : undefined,
      }),
    );

    return;
  }

  // Новый формат { author, content, optional chatId, messageId }
  if (payload.author && typeof payload.content === 'string') {
    const first = payload.author.firstName || '';
    const last = payload.author.lastName || '';
    const title = [first, last].map(s => s.trim()).filter(Boolean).join(' ') || 'New message';
    const body = payload.content;
    const chatId = typeof payload.chatId === 'number' ? payload.chatId : null;
    const messageId = typeof payload.messageId === 'number' ? payload.messageId : null;

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        data: chatId !== null && messageId !== null ? { chatId, messageId } : undefined,
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
  const chatId = typeof data.chatId === 'number' ? data.chatId : null;
  const messageId = typeof data.messageId === 'number' ? data.messageId : null;

  if (chatId === null || messageId === null) {
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
    const targetUrl = buildTargetUrl(chatId, messageId);
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
