import { ChatMessageStatusUpdate } from '../interfaces/chat-message-status-update.model';

export interface ChatStatusMessage {
  id: number;
  deliveredAt?: Date | string | null;
  seenAt?: Date | string | null;
}

type ExtraStatusFieldsMapper<T extends ChatStatusMessage> = (
  message: T,
  update: ChatMessageStatusUpdate,
) => Partial<T>;

export function appendMessageIfNotExists<T extends ChatStatusMessage>(
  messages: T[],
  message: T,
  pendingStatusUpdates: Map<number, ChatMessageStatusUpdate>,
  mapExtraStatusFields?: ExtraStatusFieldsMapper<T>,
): { messages: T[]; appended: boolean } {
  if (messages.some((existingMessage) => existingMessage.id === message.id)) {
    return { messages, appended: false };
  }

  return {
    messages: [...messages, applyPendingStatusUpdate(message, pendingStatusUpdates, mapExtraStatusFields)],
    appended: true,
  };
}

export function applyPendingStatusUpdate<T extends ChatStatusMessage>(
  message: T,
  pendingStatusUpdates: Map<number, ChatMessageStatusUpdate>,
  mapExtraStatusFields?: ExtraStatusFieldsMapper<T>,
): T {
  const pendingUpdate = pendingStatusUpdates.get(message.id);
  if (!pendingUpdate) {
    return message;
  }

  pendingStatusUpdates.delete(message.id);
  return applyStatusUpdateToMessage(message, pendingUpdate, mapExtraStatusFields);
}

export function applyStatusUpdateToMessages<T extends ChatStatusMessage>(
  messages: T[],
  update: ChatMessageStatusUpdate,
  mapExtraStatusFields?: ExtraStatusFieldsMapper<T>,
): { messages: T[]; didUpdateExistingMessage: boolean } {
  let didUpdateExistingMessage = false;

  const updatedMessages = messages.map((message) => {
    if (message.id !== update.messageId) {
      return message;
    }

    didUpdateExistingMessage = true;
    return applyStatusUpdateToMessage(message, update, mapExtraStatusFields);
  });

  return {
    messages: updatedMessages,
    didUpdateExistingMessage,
  };
}

export function applyStatusUpdateToMessage<T extends ChatStatusMessage>(
  message: T,
  update: ChatMessageStatusUpdate,
  mapExtraStatusFields?: ExtraStatusFieldsMapper<T>,
): T {
  return {
    ...message,
    deliveredAt: pickLaterDate(message.deliveredAt, update.deliveredAt),
    seenAt: resolveSeenAt(message.seenAt, update.seenAt),
    ...(mapExtraStatusFields?.(message, update) ?? {}),
  } as T;
}

export function mergeStatusUpdates(
  currentUpdate: ChatMessageStatusUpdate | undefined,
  nextUpdate: ChatMessageStatusUpdate,
): ChatMessageStatusUpdate {
  if (!currentUpdate) {
    return nextUpdate;
  }

  return {
    ...nextUpdate,
    deliveredAt: toStatusTimestamp(pickLaterDate(currentUpdate.deliveredAt, nextUpdate.deliveredAt)),
    seenAt: nextUpdate.seenAt === null
      ? null
      : toStatusTimestamp(pickLaterDate(currentUpdate.seenAt, nextUpdate.seenAt)),
    seenByUserIds: nextUpdate.seenByUserIds ?? currentUpdate.seenByUserIds ?? [],
    seenByUserNames: nextUpdate.seenByUserNames ?? currentUpdate.seenByUserNames ?? [],
    seenByUserProfilePictureUrls:
      nextUpdate.seenByUserProfilePictureUrls ?? currentUpdate.seenByUserProfilePictureUrls ?? [],
  };
}

export function pickLaterDate(
  currentValue: Date | string | null | undefined,
  nextValue: string | null,
): Date | string | null | undefined {
  if (!nextValue) {
    return currentValue;
  }

  if (!currentValue) {
    return nextValue;
  }

  return new Date(nextValue).getTime() >= new Date(currentValue).getTime()
    ? nextValue
    : currentValue;
}

export function resolveSeenAt(
  currentValue: Date | string | null | undefined,
  nextValue: string | null,
): Date | string | null | undefined {
  if (nextValue === null) {
    return null;
  }

  return pickLaterDate(currentValue, nextValue);
}

export function toStatusTimestamp(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return typeof value === 'string'
    ? value
    : value.toISOString();
}
