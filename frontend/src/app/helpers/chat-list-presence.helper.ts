import { ChatInboxItem } from '../interfaces/chat-inbox-item.model';

export interface ChatListPresenceSyncPlan {
  stalePrivateUserIds: string[];
  staleGroupIds: number[];
  missingPrivateUserIds: string[];
  missingGroupIds: number[];
}

export function planChatListPresenceSync(
  items: ChatInboxItem[],
  currentUserId: string | null,
  privatePresenceByUserId: ReadonlyMap<string, boolean>,
  groupPresenceByGroupId: ReadonlyMap<number, boolean>,
): ChatListPresenceSyncPlan {
  const privateUserIds = new Set(
    items
      .filter((item) => item.type === 'private' && !!item.otherUserId && item.otherUserId !== currentUserId)
      .map((item) => item.otherUserId as string),
  );

  const groupIds = new Set(
    items
      .filter((item) => item.type === 'group' && !!item.groupId)
      .map((item) => item.groupId as number),
  );

  return {
    stalePrivateUserIds: Array.from(privatePresenceByUserId.keys()).filter((userId) => !privateUserIds.has(userId)),
    staleGroupIds: Array.from(groupPresenceByGroupId.keys()).filter((groupId) => !groupIds.has(groupId)),
    missingPrivateUserIds: Array.from(privateUserIds).filter((userId) => !privatePresenceByUserId.has(userId)),
    missingGroupIds: Array.from(groupIds).filter((groupId) => !groupPresenceByGroupId.has(groupId)),
  };
}

export function shouldShowChatListPresenceDot(
  item: ChatInboxItem,
  currentUserId: string | null,
  privatePresenceByUserId: ReadonlyMap<string, boolean>,
  groupPresenceByGroupId: ReadonlyMap<number, boolean>,
): boolean {
  if (item.type === 'private') {
    return !!item.otherUserId
      && item.otherUserId !== currentUserId
      && privatePresenceByUserId.get(item.otherUserId) === true;
  }

  return !!item.groupId && groupPresenceByGroupId.get(item.groupId) === true;
}

export interface ChatListPresenceUpdateResult {
  nextPrivatePresenceByUserId: Map<string, boolean>;
  groupIdsToReload: number[];
}

export function applyChatListPresenceUpdate(
  items: ChatInboxItem[],
  userId: string,
  isOnline: boolean,
  currentUserId: string | null,
  privatePresenceByUserId: ReadonlyMap<string, boolean>,
): ChatListPresenceUpdateResult {
  const groupIdsToReload = items
    .filter((item) => item.type === 'group' && !!item.groupId)
    .map((item) => item.groupId as number);

  if (userId === currentUserId) {
    return {
      nextPrivatePresenceByUserId: new Map(privatePresenceByUserId),
      groupIdsToReload,
    };
  }

  const matchingPrivateUserIds = new Set(
    items
      .filter((item) => item.type === 'private' && item.otherUserId === userId)
      .map((item) => item.otherUserId as string),
  );

  if (!matchingPrivateUserIds.size) {
    return {
      nextPrivatePresenceByUserId: new Map(privatePresenceByUserId),
      groupIdsToReload,
    };
  }

  const nextPrivatePresenceByUserId = new Map(privatePresenceByUserId);
  nextPrivatePresenceByUserId.set(userId, isOnline);

  return {
    nextPrivatePresenceByUserId,
    groupIdsToReload: [],
  };
}
