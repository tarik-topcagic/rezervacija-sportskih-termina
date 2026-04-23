import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Group, MembershipStatus } from '../interfaces/group.model';
import { User } from '../interfaces/user';
import { TranslatePipe } from '../pipes/translate.pipe';
import { GroupService } from '../../services/group.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-choose-group-modal',
  imports: [NgFor, NgIf, FormsModule, TranslatePipe],
  templateUrl: './choose-group-modal.component.html',
  styleUrl: './choose-group-modal.component.scss'
})
export class ChooseGroupModalComponent implements OnChanges {
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();

  groupSearchQuery = '';
  adminGroups: Group[] = [];
  groupStatuses = new Map<number, MembershipStatus>();
  groupMembershipIds = new Map<number, number>();
  invitingGroupIds = new Set<number>();
  cancelingInvitationGroupIds = new Set<number>();
  respondingJoinRequestGroupIds = new Set<number>();
  isLoadingGroups = false;
  inviteSuccessMessage = '';
  inviteErrorMessage = '';

  constructor(
    private groupService: GroupService,
    private languageService: LanguageService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user?.id) {
      this.resetModalState();
      this.loadAdminGroupsForUser(this.user.id);
    }
  }

  closeModal(): void {
    this.resetModalState();
    this.close.emit();
  }

  handleGroupInviteAction(group: Group): void {
    if (this.canCancelGroupInvitation(group)) {
      this.cancelGroupInvitation(group);
      return;
    }

    this.inviteUserToGroup(group);
  }

  acceptJoinRequest(group: Group): void {
    this.respondToJoinRequest(group, true);
  }

  declineJoinRequest(group: Group): void {
    this.respondToJoinRequest(group, false);
  }

  get filteredAdminGroups(): Group[] {
    const query = this.groupSearchQuery.trim().toLowerCase();

    if (!query) {
      return this.adminGroups;
    }

    return this.adminGroups.filter((group) =>
      group.name.toLowerCase().includes(query)
      || group.grad?.toLowerCase().includes(query)
      || group.kategorijaSporta?.toLowerCase().includes(query)
    );
  }

  getGroupInviteLabel(group: Group): string {
    if (this.isCancelingGroupInvitation(group)) {
      return 'canceling';
    }

    if (this.isInvitingGroup(group)) {
      return 'sendingInvitation';
    }

    const status = this.getGroupStatus(group);
    if (status === MembershipStatus.Accepted) {
      return 'member';
    }

    if (status === MembershipStatus.PendingInvitation || status === MembershipStatus.PendingJoinRequest) {
      return 'pending';
    }

    return 'inviteUser';
  }

  getGroupInviteIcon(group: Group): string {
    const status = this.getGroupStatus(group);

    if (status === MembershipStatus.PendingInvitation) {
      return 'bi-x-circle';
    }

    if (status === MembershipStatus.PendingJoinRequest) {
      return 'bi-clock';
    }

    if (status === MembershipStatus.Accepted) {
      return 'bi-check-circle';
    }

    return 'bi-person-plus';
  }

  isInvitingGroup(group: Group): boolean {
    return this.invitingGroupIds.has(group.id);
  }

  isCancelingGroupInvitation(group: Group): boolean {
    return this.cancelingInvitationGroupIds.has(group.id);
  }

  isRespondingJoinRequest(group: Group): boolean {
    return this.respondingJoinRequestGroupIds.has(group.id);
  }

  isGroupInviteDisabled(group: Group): boolean {
    return this.isInvitingGroup(group)
      || this.isCancelingGroupInvitation(group)
      || this.isRespondingJoinRequest(group)
      || this.isPendingJoinRequestForGroup(group)
      || this.isAcceptedMemberForGroup(group);
  }

  isGroupConnected(group: Group): boolean {
    const status = this.getGroupStatus(group);

    return status === MembershipStatus.PendingInvitation
      || status === MembershipStatus.PendingJoinRequest
      || status === MembershipStatus.Accepted;
  }

  canCancelGroupInvitation(group: Group): boolean {
    return this.getGroupStatus(group) === MembershipStatus.PendingInvitation
      && !this.isInvitingGroup(group)
      && !this.isCancelingGroupInvitation(group)
      && !this.isRespondingJoinRequest(group);
  }

  canRespondToJoinRequest(group: Group): boolean {
    return this.getGroupStatus(group) === MembershipStatus.PendingJoinRequest
      && !!this.groupMembershipIds.get(group.id)
      && !this.isInvitingGroup(group)
      && !this.isCancelingGroupInvitation(group)
      && !this.isRespondingJoinRequest(group);
  }

  getGroupInviteTitle(group: Group): string {
    return this.canCancelGroupInvitation(group)
      ? 'cancelInvitation'
      : this.getGroupInviteLabel(group);
  }

  private inviteUserToGroup(group: Group): void {
    if (!this.user?.id || !this.canInviteToGroup(group)) {
      return;
    }

    this.invitingGroupIds.add(group.id);
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';

    this.groupService.sendInvite(group.id, this.user.id).subscribe(
      () => {
        this.invitingGroupIds.delete(group.id);
        this.groupStatuses.set(group.id, MembershipStatus.PendingInvitation);
        this.inviteSuccessMessage = this.languageService.translate('invitationSent');
      },
      (error) => {
        this.invitingGroupIds.delete(group.id);

        if (error?.status === 400) {
          this.groupStatuses.set(group.id, MembershipStatus.PendingInvitation);
        } else {
          this.inviteErrorMessage = this.languageService.translate('invitationSendError');
        }

        console.error('Error sending group invitation:', error);
      },
    );
  }

  private cancelGroupInvitation(group: Group): void {
    if (!this.user?.id || !this.canCancelGroupInvitation(group)) {
      return;
    }

    this.cancelingInvitationGroupIds.add(group.id);
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';

    this.groupService.cancelInvitation(group.id, this.user.id).subscribe(
      () => {
        this.cancelingInvitationGroupIds.delete(group.id);
        this.groupStatuses.delete(group.id);
        this.groupMembershipIds.delete(group.id);
        this.inviteSuccessMessage = this.languageService.translate('invitationCancelled');
      },
      (error) => {
        this.cancelingInvitationGroupIds.delete(group.id);
        this.inviteErrorMessage = this.languageService.translate('cancelInvitationError');
        console.error('Error cancelling group invitation:', error);
      },
    );
  }

  private canInviteToGroup(group: Group): boolean {
    return !!this.user?.id
      && !this.isGroupConnected(group)
      && !this.isInvitingGroup(group)
      && !this.isCancelingGroupInvitation(group);
  }

  private respondToJoinRequest(group: Group, accept: boolean): void {
    const membershipId = this.groupMembershipIds.get(group.id);
    if (!membershipId || !this.canRespondToJoinRequest(group)) {
      return;
    }

    this.respondingJoinRequestGroupIds.add(group.id);
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';

    this.groupService.respondJoinRequest(group.id, membershipId, accept).subscribe(
      () => {
        this.respondingJoinRequestGroupIds.delete(group.id);

        if (accept) {
          this.groupStatuses.set(group.id, MembershipStatus.Accepted);
          this.inviteSuccessMessage = this.languageService.translate('joinRequestAccepted');
        } else {
          this.groupStatuses.delete(group.id);
          this.groupMembershipIds.delete(group.id);
          this.inviteSuccessMessage = this.languageService.translate('joinRequestDeclined');
        }
      },
      (error) => {
        this.respondingJoinRequestGroupIds.delete(group.id);
        this.inviteErrorMessage = this.languageService.translate('joinRequestResponseError');
        console.error('Error responding to join request:', error);
      },
    );
  }

  private isPendingJoinRequestForGroup(group: Group): boolean {
    return this.getGroupStatus(group) === MembershipStatus.PendingJoinRequest;
  }

  private isAcceptedMemberForGroup(group: Group): boolean {
    return this.getGroupStatus(group) === MembershipStatus.Accepted;
  }

  private loadAdminGroupsForUser(userId: string): void {
    this.isLoadingGroups = true;
    this.groupStatuses.clear();
    this.groupMembershipIds.clear();

    this.groupService.getMyGroups().subscribe(
      (groups) => {
        this.adminGroups = groups;
        this.loadGroupStatusesForUser(userId);
      },
      (error) => {
        this.isLoadingGroups = false;
        this.inviteErrorMessage = this.languageService.translate('groupsLoadError');
        console.error('Error loading admin groups:', error);
      },
    );
  }

  private loadGroupStatusesForUser(userId: string): void {
    this.groupService.getMembershipStatusForAdminGroups(userId).subscribe(
      (states) => {
        states.forEach((state) => {
          if (state.status !== MembershipStatus.Declined) {
            this.groupStatuses.set(state.groupId, state.status);
            this.groupMembershipIds.set(state.groupId, state.membershipId);
          }
        });
        this.isLoadingGroups = false;
      },
      (error) => {
        this.isLoadingGroups = false;
        this.inviteErrorMessage = this.languageService.translate('groupsLoadError');
        console.error('Error loading group membership states:', error);
      },
    );
  }

  private getGroupStatus(group: Group): MembershipStatus | undefined {
    return this.groupStatuses.get(group.id);
  }

  private resetModalState(): void {
    this.groupSearchQuery = '';
    this.adminGroups = [];
    this.groupStatuses.clear();
    this.groupMembershipIds.clear();
    this.invitingGroupIds.clear();
    this.cancelingInvitationGroupIds.clear();
    this.respondingJoinRequestGroupIds.clear();
    this.isLoadingGroups = false;
    this.inviteSuccessMessage = '';
    this.inviteErrorMessage = '';
  }
}
