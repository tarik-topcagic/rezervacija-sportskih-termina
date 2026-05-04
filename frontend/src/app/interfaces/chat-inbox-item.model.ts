export interface ChatInboxItem {
  type: 'group' | 'private';
  id: number;
  title: string;
  subtitle?: string;
  otherUserId?: string;
  preview: string;
  createdAt: string;
  unreadCount: number;
  isRead: boolean;
  imageUrl?: string | null;
  fallbackIcon: string;
  groupId?: number;
  conversationId?: number;
}
