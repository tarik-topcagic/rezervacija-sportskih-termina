export interface ChatTypingEvent {
  userId: string;
  userName: string;
  type: 'group' | 'private';
  targetId: string;
}
