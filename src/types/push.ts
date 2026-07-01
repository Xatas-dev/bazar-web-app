/* eslint-disable @typescript-eslint/no-unused-vars */
import { MessageAuthor } from '@/types/chat';

export interface PushPublicKeyResponse {
  publicKey: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Внутренний нормализованный тип, который используется на фронте
export interface PushNotificationPayload {
  title: string;
  body: string;
  avatar?: string; // инициалы или заглушка (например "ПК")
  spaceId?: number;
  messageId?: number;
}

// Исходные форматы от бекенда (для ясности)
export interface PushNotificationRawOld {
  title: string;
  body: string;
  spaceId: number;
  messageId: number;
}

export interface PushNotificationRawNew {
  author: MessageAuthor;
  content: string;
  // опционально бекенд может добавить навигационные метаданные
  spaceId?: number;
  messageId?: number;
}

export interface PushClickData {
  spaceId: number;
  messageId?: number;
}
