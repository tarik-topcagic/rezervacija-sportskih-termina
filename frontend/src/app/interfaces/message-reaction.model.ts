export interface MessageReaction {
  userId: string;
  userName: string;
  emoji: string;
}

export type ChatMessageSendStatus = 'sending' | 'failed';

export interface ChatMessageReplyPreview {
  replyToMessageId?: number | null;
  replyToSenderName?: string | null;
  replyToMessageTextPreview?: string | null;
  replyToIsDeleted?: boolean;
}
