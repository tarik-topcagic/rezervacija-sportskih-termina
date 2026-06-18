import { GroupService } from '../../services/group.service';
import { LanguageService } from '../../services/language.service';
import { ToastService } from '../../services/toast.service';

type ActionHandlers<T = unknown> = {
  onSuccess: (value: T) => void;
  onError: (error: any) => void;
};

type ToastActionHandlers<T = unknown> = ActionHandlers<T> & {
  languageService: LanguageService;
  toastService: ToastService;
  successKey: string;
};

function executeAction<T>(
  request: { subscribe: (observer: { next: (value: T) => void; error: (error: any) => void }) => void },
  handlers: ActionHandlers<T>,
): void {
  request.subscribe({
    next: (value) => {
      handlers.onSuccess(value);
    },
    error: (error) => {
      handlers.onError(error);
    },
  });
}

function executeToastAction<T>(
  request: { subscribe: (observer: { next: (value: T) => void; error: (error: any) => void }) => void },
  handlers: ToastActionHandlers<T>,
): void {
  executeAction(request, {
    onSuccess: (value) => {
      handlers.toastService.showSuccess(
        handlers.languageService.translate(handlers.successKey),
      );
      handlers.onSuccess(value);
    },
    onError: (error) => {
      handlers.onError(error);
    },
  });
}

export function requestGroupAccess(
  groupService: GroupService,
  groupId: number,
  handlers: ToastActionHandlers,
): void {
  executeToastAction(groupService.requestToJoin(groupId), handlers);
}

export function cancelGroupAccessRequest(
  groupService: GroupService,
  groupId: number,
  handlers: ToastActionHandlers,
): void {
  executeToastAction(groupService.cancelJoinRequest(groupId), handlers);
}

export function respondToGroupInvitation(
  groupService: GroupService,
  membershipId: number,
  accept: boolean,
  groupId: number | undefined,
  handlers: ActionHandlers,
): void {
  executeAction(groupService.respondInvite(membershipId, accept, groupId), handlers);
}

export function respondToGroupJoinRequest(
  groupService: GroupService,
  groupId: number,
  membershipId: number,
  accept: boolean,
  handlers: ActionHandlers,
): void {
  executeAction(groupService.respondJoinRequest(groupId, membershipId, accept), handlers);
}

export function sendGroupInvitation(
  groupService: GroupService,
  groupId: number,
  userId: string,
  handlers: ToastActionHandlers,
): void {
  executeToastAction(groupService.sendInvite(groupId, userId), handlers);
}

export function cancelGroupInvitation(
  groupService: GroupService,
  groupId: number,
  userId: string,
  handlers: ToastActionHandlers,
): void {
  executeToastAction(groupService.cancelInvitation(groupId, userId), handlers);
}
