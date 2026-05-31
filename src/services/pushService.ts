import { chatAxiosInstance } from '@/lib/axios';
import { PushClickData, PushNotificationPayload, PushPublicKeyResponse } from '@/types/push';

const SERVICE_WORKER_URL = '/sw.js';
const SERVICE_WORKER_SCOPE = '/';

let serviceWorkerRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;
let pushSubscribePromise: Promise<PushSubscription | null> | null = null;
let pushUnsubscribePromise: Promise<void> | null = null;
let lastSyncedSubscriptionEndpoint: string | null = null;

const isWindowAvailable = typeof window !== 'undefined';
const isNavigatorAvailable = typeof navigator !== 'undefined';

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
};

const base64UrlToArrayBuffer = (base64String: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray.buffer;
};

const getSubscriptionPayload = (subscription: PushSubscription) => {
  const p256dhKey = subscription.getKey('p256dh');
  const authKey = subscription.getKey('auth');

  if (!p256dhKey || !authKey) {
    throw new Error('Push subscription keys are missing');
  }

  return {
    endpoint: subscription.endpoint,
    p256dh: arrayBufferToBase64(p256dhKey),
    auth: arrayBufferToBase64(authKey),
  };
};

const logPushError = (message: string, error: unknown) => {
  console.error(`[WebPush] ${message}`, error);
};

const isNotificationSupported = () => isWindowAvailable && 'Notification' in window;

const isPushManagerSupported = () => isWindowAvailable && 'PushManager' in window;

const isServiceWorkerSupported = () => isNavigatorAvailable && 'serviceWorker' in navigator;

export const pushService = {
  isPushSupported(): boolean {
    return Boolean(
      isWindowAvailable
      && isNavigatorAvailable
      && window.isSecureContext
      && isServiceWorkerSupported()
      && isPushManagerSupported()
      && isNotificationSupported(),
    );
  },

  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isPushSupported()) {
      return null;
    }

    if (serviceWorkerRegistrationPromise) {
      return serviceWorkerRegistrationPromise;
    }

    serviceWorkerRegistrationPromise = (async () => {
      try {
        const existingRegistration = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL);
        if (existingRegistration) {
          return existingRegistration;
        }

        return await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
          scope: SERVICE_WORKER_SCOPE,
        });
      } catch (error) {
        logPushError('Service Worker registration failed', error);
        serviceWorkerRegistrationPromise = null;
        return null;
      }
    })();

    return serviceWorkerRegistrationPromise;
  },

  async getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!this.isPushSupported()) {
      return null;
    }

    const registration = await this.registerServiceWorker();
    if (!registration) {
      return null;
    }

    try {
      return await registration.pushManager.getSubscription();
    } catch (error) {
      logPushError('Failed to read current push subscription', error);
      return null;
    }
  },

  async subscribe(): Promise<PushSubscription | null> {
    if (pushSubscribePromise) {
      return pushSubscribePromise;
    }

    pushSubscribePromise = (async () => {
      if (!this.isPushSupported()) {
        return null;
      }

      try {
        const registration = await this.registerServiceWorker();
        if (!registration) {
          return null;
        }

        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          await this.syncSubscription(existingSubscription);
          return existingSubscription;
        }

        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }

        if (permission !== 'granted') {
          return null;
        }

        const publicKeyResponse = await chatAxiosInstance.get<PushPublicKeyResponse>('/push/public-key');
        const applicationServerKey = base64UrlToArrayBuffer(publicKeyResponse.data.publicKey);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        await this.syncSubscription(subscription);
        return subscription;
      } catch (error) {
        logPushError('Failed to subscribe to push notifications', error);
        return null;
      } finally {
        pushSubscribePromise = null;
      }
    })();

    return pushSubscribePromise;
  },

  async unsubscribe(): Promise<void> {
    if (pushUnsubscribePromise) {
      return pushUnsubscribePromise;
    }

    pushUnsubscribePromise = (async () => {
      if (!this.isPushSupported()) {
        return;
      }

      try {
        const registration = await this.registerServiceWorker();
        if (!registration) {
          return;
        }

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          lastSyncedSubscriptionEndpoint = null;
          return;
        }

        const endpoint = subscription.endpoint;
        await chatAxiosInstance.delete('/push/subscriptions', {
          data: {
            endpoint,
          },
        });

        await subscription.unsubscribe();
        if (lastSyncedSubscriptionEndpoint === endpoint) {
          lastSyncedSubscriptionEndpoint = null;
        }
      } catch (error) {
        logPushError('Failed to unsubscribe from push notifications', error);
      } finally {
        pushUnsubscribePromise = null;
      }
    })();

    return pushUnsubscribePromise;
  },

  async syncSubscription(subscription: PushSubscription): Promise<void> {
    const payload = getSubscriptionPayload(subscription);

    if (lastSyncedSubscriptionEndpoint === payload.endpoint) {
      return;
    }

    await chatAxiosInstance.post('/push/subscriptions', payload);
    lastSyncedSubscriptionEndpoint = payload.endpoint;
  },

  getNotificationTargetUrl(data: PushClickData): string {
    const targetUrl = new URL('/spaces', window.location.origin);
    targetUrl.searchParams.set('chatId', String(data.chatId));
    targetUrl.searchParams.set('messageId', String(data.messageId));
    targetUrl.searchParams.set('tab', 'chat');
    return targetUrl.toString();
  },

  parseNotificationPayload(data: unknown): PushNotificationPayload | null {
    try {
      if (!data || typeof data !== 'object') {
        return null;
      }

      const asOld = data as Partial<{ title: string; body: string; chatId: number; messageId: number }>;

      if (
        typeof asOld.title === 'string'
        && typeof asOld.body === 'string'
      ) {
        return {
          title: asOld.title,
          body: asOld.body,
          chatId: typeof asOld.chatId === 'number' ? asOld.chatId : undefined,
          messageId: typeof asOld.messageId === 'number' ? asOld.messageId : undefined,
        };
      }

      // New format: { author: MessageAuthor, content: string, chatId?, messageId? }
      const asNew = data as Partial<{ author: { firstName?: string | null; lastName?: string | null }; content: string; chatId?: number; messageId?: number }>;

      if (asNew.author && typeof asNew.content === 'string') {
        const first = asNew.author.firstName || '';
        const last = asNew.author.lastName || '';
        const title = [first, last].map(s => s.trim()).filter(Boolean).join(' ') || 'New message';

        return {
          title,
          body: asNew.content,
          chatId: typeof asNew.chatId === 'number' ? asNew.chatId : undefined,
          messageId: typeof asNew.messageId === 'number' ? asNew.messageId : undefined,
        };
      }

      console.warn('[WebPush] Unknown push payload format', data);
      return null;
    } catch (err) {
      console.error('[WebPush] Error parsing push payload', err);
      return null;
    }
  },
};

