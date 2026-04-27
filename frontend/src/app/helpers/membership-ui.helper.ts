import { MembershipStatus } from '../interfaces/group.model';

export function isPendingInvitation(status?: MembershipStatus): boolean {
  return status === MembershipStatus.PendingInvitation;
}

export function isPendingJoinRequest(status?: MembershipStatus): boolean {
  return status === MembershipStatus.PendingJoinRequest;
}

export function isAcceptedMember(status?: MembershipStatus): boolean {
  return status === MembershipStatus.Accepted;
}

export function hasActiveMembershipConnection(status?: MembershipStatus): boolean {
  return isPendingInvitation(status)
    || isPendingJoinRequest(status)
    || isAcceptedMember(status);
}

export function getMembershipInviteLabel(
  status?: MembershipStatus,
  isInviting = false,
  isCanceling = false,
  busyLabel = 'sendingInvitation',
): string {
  if (isInviting || isCanceling) {
    return busyLabel;
  }

  if (isAcceptedMember(status)) {
    return 'member';
  }

  if (isPendingInvitation(status) || isPendingJoinRequest(status)) {
    return 'pending';
  }

  return 'inviteUser';
}

export function getMembershipInviteIcon(
  status?: MembershipStatus,
  options?: {
    pendingInvitationIcon?: string;
    pendingJoinRequestIcon?: string;
    acceptedIcon?: string;
    defaultIcon?: string;
  },
): string {
  const {
    pendingInvitationIcon = 'bi-x-circle',
    pendingJoinRequestIcon = 'bi-x-circle',
    acceptedIcon = 'bi-clock',
    defaultIcon = 'bi-person-plus',
  } = options ?? {};

  if (isPendingInvitation(status)) {
    return pendingInvitationIcon;
  }

  if (isPendingJoinRequest(status)) {
    return pendingJoinRequestIcon;
  }

  if (isAcceptedMember(status)) {
    return acceptedIcon;
  }

  return defaultIcon;
}
