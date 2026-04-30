export interface ChatMessageStatusUpdate {
  messageId: number;
  chatType: 'group' | 'private';
  groupId: number | null;
  conversationId: number | null;
  userId: string;
  deliveredAt: string | null;
  seenAt: string | null;
  seenByUserIds?: string[];
  seenByUserNames?: string[];
  seenByUserProfilePictureUrls?: string[];
}
