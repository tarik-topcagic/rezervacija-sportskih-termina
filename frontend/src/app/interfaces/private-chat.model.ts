import { ChatMessageSendStatus, MessageReaction } from './message-reaction.model';

export interface PrivateConversation {
  id: number;
  otherUserId: string;
  otherUsername: string;
  otherFullName: string;
  otherProfilePictureUrl: string | null;
  latestMessagePreview?: string | null;
  latestMessageCreatedAt?: Date | null;
  createdAt: Date;
}

export interface PrivateMessage {
  id: number;
  conversationId: number;
  senderUserId: string;
  senderUsername: string;
  senderFullName: string;
  senderProfilePictureUrl: string | null;
  messageText: string;
  createdAt: Date | string;
  deliveredAt?: Date | string | null;
  seenAt?: Date | string | null;
  isPinned?: boolean;
  pinnedAt?: Date | string | null;
  replyToMessageId?: number | null;
  replyToSenderName?: string | null;
  replyToMessageTextPreview?: string | null;
  replyToIsDeleted?: boolean;
  reactions?: MessageReaction[];
  clientTempId?: string;
  sendStatus?: ChatMessageSendStatus;
}
