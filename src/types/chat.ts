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
  replyMessageId?: number;
}

export enum AuthorStatus {
  EXIST = 'EXIST',
  UNKNOWN = 'UNKNOWN'
}

export interface MessageAuthor {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  status: AuthorStatus;
}

export interface ReplyMessage {
  id: number;
  author: MessageAuthor;
  contentPreview: string;
}

export interface MessageResponse {
  id: number;
  chatId: number;
  author: MessageAuthor;
  content: string;
  createdAt: string;
  isDeletable?: boolean;
  reply?: ReplyMessage;
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
  reply?: ReplyMessage;
}

export interface MessageDeletedPayload {
  ids: number[];
}

export interface WebSocketChatEvent {
  type: ChatEventType;
  chatId: number;
  payload: MessageCreatedPayload | MessageDeletedPayload;
}
