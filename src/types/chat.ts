export interface CreateChatRequest {
  spaceId: number;
}

export interface ChatResponse {
  id: number;
  spaceId: number;
  createdAt: string;
}

export interface CreateMessageRequest {
  content: string;
}

export interface MessageResponse {
  id: number;
  chatId: number;
  userId: string;
  content: string;
  createdAt: string;
  canDelete?: boolean;
}

export interface MessagePageResponse {
  content: MessageResponse[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface DeleteMessagesRequest {
  messageIds: number[];
}

// WebSocket Event Types
export enum ChatEventType {
  CREATED = 'CREATED',
  DELETED = 'DELETED'
}

export interface MessageCreatedPayload {
  id: number;
  userId: string;
  content: string;
  createdAt: string;
}

export interface MessageDeletedPayload {
  ids: number[];
}

export interface WebSocketChatEvent {
  type: ChatEventType;
  chatId: number;
  payload: MessageCreatedPayload | MessageDeletedPayload;
}
