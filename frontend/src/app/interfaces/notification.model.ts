import { MembershipStatus } from './group.model';

export enum AppNotificationType {
  GroupInvitationReceived = 'GroupInvitationReceived',
  GroupInvitationAccepted = 'GroupInvitationAccepted',
  GroupJoinRequestReceived = 'GroupJoinRequestReceived',
  GroupJoinRequestAccepted = 'GroupJoinRequestAccepted',
  ReservationReminder1Hour = 'ReservationReminder1Hour',
  ReservationReminder30Minutes = 'ReservationReminder30Minutes'
}

export interface AppNotification {
  id: number;
  type: AppNotificationType;
  username: string;
  actorUserId?: string | null;
  actorName?: string | null;
  groupId?: number | null;
  groupName?: string | null;
  membershipId?: number | null;
  invitationStatus?: MembershipStatus | null;
  membershipStatus?: MembershipStatus | null;
  reservationId?: number | null;
  arenaId?: number | null;
  arenaName?: string | null;
  reservationStartTime?: string | null;
  isRead: boolean;
  createdAt: string;
}
