import { MembershipStatus } from './group.model';

export enum AppNotificationType {
  GroupInvitationReceived = 'GroupInvitationReceived',
  GroupInvitationAccepted = 'GroupInvitationAccepted',
  GroupJoinRequestReceived = 'GroupJoinRequestReceived',
  GroupJoinRequestAccepted = 'GroupJoinRequestAccepted'
}

export interface AppNotification {
  id: number;
  type: AppNotificationType;
  userId: string;
  actorUserId?: string | null;
  actorName?: string | null;
  groupId?: number | null;
  groupName?: string | null;
  membershipId?: number | null;
  invitationStatus?: MembershipStatus | null;
  membershipStatus?: MembershipStatus | null;
  isRead: boolean;
  createdAt: string;
}
