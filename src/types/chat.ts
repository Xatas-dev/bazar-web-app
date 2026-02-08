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

export enum AuthorStatus {
  RESOLVED = 'RESOLVED',
  UNKNOWN = 'UNKNOWN'
}

export interface MessageAuthor {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  status: AuthorStatus;
}

export interface MessageResponse {
  id: number;
  chatId: number;
  author: MessageAuthor;
  content: string;
  createdAt: string;
  isDeletable?: boolean;
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
  author: MessageAuthor;
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
