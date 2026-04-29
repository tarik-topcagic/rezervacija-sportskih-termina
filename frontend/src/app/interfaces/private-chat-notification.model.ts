export interface PrivateChatNotification {
  conversationId: number;
  otherUserId: string;
  otherUsername: string;
  otherFullName: string;
  otherProfilePictureUrl?: string | null;
  latestMessagePreview: string;
  createdAt: string;
  unreadCount: number;
  isRead: boolean;
}
