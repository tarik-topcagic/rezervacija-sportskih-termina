import { MessageReaction } from './message-reaction.model';

export interface ChatMessageDeletedEvent {
  messageId: number;
  groupId: number | null;
  conversationId: number | null;
  isChatNowEmpty: boolean;
  updatedPreviewText?: string | null;
  updatedPreviewCreatedAt?: string | null;
  updatedPreviewSenderUserId?: string | null;
  updatedPreviewSenderName?: string | null;
}

export interface ChatMessagePinStateChangedEvent {
  messageId: number;
  groupId: number | null;
  conversationId: number | null;
  isPinned: boolean;
  pinnedAt: string | null;
}

export interface ChatMessageReactionsChangedEvent {
  messageId: number;
  groupId: number | null;
  conversationId: number | null;
  reactions: MessageReaction[];
}
