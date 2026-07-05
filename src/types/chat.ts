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

export enum AllowedMessageAction {
  DELETE = 'DELETE',
  EDIT = 'EDIT'
}

export interface MessageReactionResponse {
  reactionId: string;
  count: number;
  reactedByMe: boolean;
}

export interface ChatReactionResponse {
  reactionId: string;
  value: string;
  type: string;
}

export interface MessageReactionUserResponse {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  status: AuthorStatus;
}

export interface MessageReactionUsersReactionResponse {
  reactionId: string;
  users: MessageReactionUserResponse[];
}

export interface MessageReactionUsersResponse {
  reactions: MessageReactionUsersReactionResponse[];
}

export interface MessageResponse {
  id: number;
  chatId: number;
  author: MessageAuthor;
  content: string;
  createdAt: string;
  allowedActions?: AllowedMessageAction[];
  reply?: ReplyMessage;
  reactions?: MessageReactionResponse[];
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
  DELETED = 'DELETED',
  EDITED = 'EDITED',
  REACTION_CHANGED = 'REACTION_CHANGED'
}

export interface MessageCreatedPayload {
  id: number;
  author: MessageAuthor;
  content: string;
  createdAt: string;
  allowedActions?: AllowedMessageAction[];
  reply?: ReplyMessage;
  reactions?: MessageReactionResponse[];
}

export interface MessageDeletedPayload {
  ids: number[];
}

export interface MessageEditedPayload {
  messageId: number;
  newContent: string;
}

export interface MessageReactionChangedPayload {
  messageId: string;
  reactionId: string;
  count: number;
  added: boolean;
  author: MessageAuthor;
}

export interface WebSocketChatEvent {
  type: ChatEventType;
  chatId: number;
  payload: MessageCreatedPayload | MessageDeletedPayload | MessageEditedPayload | MessageReactionChangedPayload;
}

export interface MessageReactionChangeResponse {
  messageId: string;
  reactionId: string;
  count: number;
}
