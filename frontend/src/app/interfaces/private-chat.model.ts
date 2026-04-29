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
  createdAt: Date;
}
