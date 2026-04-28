export interface GroupChatNotification {
  groupId: number;
  groupName: string;
  groupImageUrl?: string | null;
  senderUserId: string;
  senderName: string;
  senderProfilePictureUrl?: string | null;
  latestMessagePreview: string;
  createdAt: string;
  unreadCount: number;
  isRead: boolean;
}
