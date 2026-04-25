import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Group, GroupDetails, GroupMember, GroupMembership, MembershipStatus } from '../interfaces/group.model';
import { GroupService } from '../../services/group.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { NavbarComponent } from '../navbar/navbar.component';
import { LanguageService } from '../../services/language.service';
import { EditGroupModalComponent } from '../edit-group-modal/edit-group-modal.component';
import { UserService } from '../../services/user.service';
import { User } from '../interfaces/user';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-group-details',
  imports: [DatePipe, FormsModule, NgFor, NgIf, RouterLink, NavbarComponent, TranslatePipe, EditGroupModalComponent],
  templateUrl: './group-details.component.html',
  styleUrl: './group-details.component.scss'
})
export class GroupDetailsComponent implements OnInit, OnDestroy {
  group: GroupDetails | null = null;
  selectedGroupToEdit: Group | null = null;
  isLoading = true;
  isRequestingAccess = false;
  isCancelingAccessRequest = false;
  isRespondingToInvitation = false;
  showEditGroupModal = false;
  showInviteMembersModal = false;
  showMembersModal = false;
  isMemberMenuOpen = false;
  removingMemberIds = new Set<string>();
  inviteSearchQuery = '';
  inviteUsers: User[] = [];
  isLoadingInviteUsers = false;
  invitationStatuses = new Map<string, MembershipStatus>();
  membershipsByUserId = new Map<string, GroupMembership>();
  invitingUserIds = new Set<string>();
  cancelingInvitationUserIds = new Set<string>();
  respondingJoinRequestUserIds = new Set<string>();
  inviteModalMessage = '';
  inviteModalError = '';
  errorMessage = '';
  successMessage = '';
  private routeSubscription?: Subscription;
  private groupDetailsRefreshSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private userService: UserService,
    private languageService: LanguageService,
    private confirmDialogService: ConfirmDialogService,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const groupId = Number(params.get('id'));

      if (!groupId) {
        this.router.navigate(['/grupe']);
        return;
      }

      this.resetViewStateForRouteChange();
      this.loadGroup(groupId);
    });

    this.groupDetailsRefreshSubscription = this.groupService.groupDetailsRefresh$.subscribe((groupId) => {
      if (this.group?.id === groupId) {
        this.loadGroup(groupId);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.groupDetailsRefreshSubscription?.unsubscribe();
  }

  requestAccess(): void {
    if (!this.group || this.group.isAdmin || this.group.isMember || this.group.hasPendingJoinRequest) {
      return;
    }

    this.isRequestingAccess = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.groupService.requestToJoin(this.group.id).subscribe(
      () => {
        this.isRequestingAccess = false;
        this.group = this.group ? { ...this.group, hasPendingJoinRequest: true } : null;
        this.successMessage = this.languageService.translate('accessRequested');
      },
      (error) => {
        this.isRequestingAccess = false;
        this.errorMessage = this.languageService.translate('requestAccessError');
        console.error('Error requesting group access:', error);
      },
    );
  }

  cancelAccessRequest(): void {
    if (!this.group || this.group.isAdmin || this.group.isMember || !this.group.hasPendingJoinRequest) {
      return;
    }

    this.isCancelingAccessRequest = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.groupService.cancelJoinRequest(this.group.id).subscribe(
      () => {
        this.isCancelingAccessRequest = false;
        this.group = this.group ? { ...this.group, hasPendingJoinRequest: false } : null;
        this.successMessage = this.languageService.translate('joinRequestCancelled');
      },
      (error) => {
        this.isCancelingAccessRequest = false;
        this.errorMessage = this.languageService.translate('cancelJoinRequestError');
        console.error('Error cancelling join request:', error);
      },
    );
  }

  acceptInvitation(): void {
    this.respondToInvitation(true);
  }

  declineInvitation(): void {
    this.respondToInvitation(false);
  }

  openEditGroupModal(): void {
    if (!this.group?.isAdmin) {
      return;
    }

    this.selectedGroupToEdit = this.toEditableGroup(this.group);
    this.showEditGroupModal = true;
  }

  closeEditGroupModal(): void {
    this.showEditGroupModal = false;
    this.selectedGroupToEdit = null;
  }

  onGroupUpdated(updatedGroup: Group): void {
    this.closeEditGroupModal();
    this.loadGroup(updatedGroup.id);
  }

  openInviteMembersModal(): void {
    if (!this.group?.isAdmin) {
      return;
    }

    this.showInviteMembersModal = true;
    this.inviteSearchQuery = '';
    this.inviteModalMessage = '';
    this.inviteModalError = '';
    this.loadInvitationStatuses();
    this.loadInviteUsers();
  }

  closeInviteMembersModal(): void {
    this.showInviteMembersModal = false;
    this.inviteUsers = [];
    this.inviteSearchQuery = '';
    this.inviteModalMessage = '';
    this.inviteModalError = '';
    this.invitingUserIds.clear();
    this.cancelingInvitationUserIds.clear();
    this.respondingJoinRequestUserIds.clear();
  }

  openMembersModal(): void {
    if (!this.group?.isMember) {
      return;
    }

    this.showMembersModal = true;
  }

  closeMembersModal(): void {
    this.showMembersModal = false;
    this.removingMemberIds.clear();
  }

  viewMemberProfile(member: GroupMember): void {
    if (!member.username) {
      return;
    }

    this.closeMembersModal();
    if (this.isCurrentUser(member)) {
      this.router.navigate(['/moj-profil']);
      return;
    }

    this.router.navigate(['/korisnicki-profil', member.username]);
  }

  toggleMemberMenu(): void {
    this.isMemberMenuOpen = !this.isMemberMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  closeMemberMenuOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (this.isMemberMenuOpen && !target?.closest('.member-status-dropdown')) {
      this.isMemberMenuOpen = false;
    }
  }

  canRemoveMember(member: GroupMember): boolean {
    return !!this.group?.isAdmin && !member.isAdmin;
  }

  isRemovingMember(member: GroupMember): boolean {
    return this.removingMemberIds.has(member.userId);
  }

  isCurrentUser(member: GroupMember): boolean {
    return !!this.group?.currentUserId && member.userId === this.group.currentUserId;
  }

  async removeMember(member: GroupMember): Promise<void> {
    if (!this.group || !this.canRemoveMember(member)) {
      return;
    }

    if (!(await this.confirmDialogService.confirm('confirmRemoveMember', {
      previewName: member.displayName || member.username,
      previewImageUrl: member.profilePictureUrl,
    }))) {
      return;
    }

    this.removingMemberIds.add(member.userId);

    this.groupService.removeMember(this.group.id, member.userId).subscribe(
      () => {
        this.removingMemberIds.delete(member.userId);
        this.group = this.group
          ? {
              ...this.group,
              members: this.group.members.filter(existingMember => existingMember.userId !== member.userId),
              membersCount: Math.max(0, this.group.membersCount - 1),
            }
          : null;
        this.closeMembersModal();
        this.successMessage = this.languageService.translate('memberRemovedFromGroup');
      },
      (error) => {
        this.removingMemberIds.delete(member.userId);
        this.errorMessage = this.languageService.translate('removeMemberError');
        console.error('Error removing group member:', error);
      },
    );
  }

  async leaveGroup(): Promise<void> {
    if (!this.group || this.group.isAdmin || !this.group.isMember) {
      return;
    }

    if (!(await this.confirmDialogService.confirm('confirmLeaveGroup'))) {
      return;
    }

    const currentUserId = this.group.currentUserId;
    this.isMemberMenuOpen = false;

    this.groupService.removeMember(this.group.id, currentUserId).subscribe(
      () => {
        this.group = this.group
          ? {
              ...this.group,
              isMember: false,
              members: this.group.members.filter(member => member.userId !== currentUserId),
              membersCount: Math.max(0, this.group.membersCount - 1),
            }
          : null;
        this.successMessage = this.languageService.translate('leftGroup');
      },
      (error) => {
        this.errorMessage = this.languageService.translate('leaveGroupError');
        console.error('Error leaving group:', error);
      },
    );
  }

  searchInviteUsers(): void {
    this.loadInviteUsers(this.inviteSearchQuery);
  }

  handleInviteAction(user: User): void {
    if (this.canCancelPendingConnection(user)) {
      this.cancelPendingConnection(user);
      return;
    }

    this.inviteUser(user);
  }

  inviteUser(user: User): void {
    if (!this.group || !user.id || !this.canInviteUser(user)) {
      return;
    }

    this.invitingUserIds.add(user.id);
    this.inviteModalMessage = '';
    this.inviteModalError = '';

    this.groupService.sendInvite(this.group.id, user.id).subscribe(
      () => {
        this.invitingUserIds.delete(user.id);
        this.invitationStatuses.set(user.id, MembershipStatus.PendingInvitation);
        this.inviteModalMessage = this.languageService.translate('invitationSent');
      },
      (error) => {
        this.invitingUserIds.delete(user.id);

        if (error?.status === 400) {
          this.invitationStatuses.set(user.id, MembershipStatus.PendingInvitation);
          this.inviteModalMessage = this.languageService.translate('pending');
        } else {
          this.inviteModalError = this.languageService.translate('invitationSendError');
        }

        console.error('Error sending group invitation:', error);
      },
    );
  }

  cancelInvitation(user: User): void {
    if (!this.group || !user.id || !this.canCancelInvitation(user)) {
      return;
    }

    this.cancelingInvitationUserIds.add(user.id);
    this.inviteModalMessage = '';
    this.inviteModalError = '';

    this.groupService.cancelInvitation(this.group.id, user.id).subscribe(
      () => {
        this.cancelingInvitationUserIds.delete(user.id);
        this.invitationStatuses.delete(user.id);
        this.membershipsByUserId.delete(user.id);
        this.inviteModalMessage = this.languageService.translate('invitationCancelled');
      },
      (error) => {
        this.cancelingInvitationUserIds.delete(user.id);
        this.inviteModalError = this.languageService.translate('cancelInvitationError');
        console.error('Error cancelling group invitation:', error);
      },
    );
  }

  acceptJoinRequest(user: User): void {
    this.respondToJoinRequest(user, true);
  }

  declineJoinRequest(user: User): void {
    this.respondToJoinRequest(user, false);
  }

  respondToJoinRequest(user: User, accept: boolean): void {
    if (!this.group || !user.id || !this.canRespondToJoinRequest(user)) {
      return;
    }

    const membership = this.membershipsByUserId.get(user.id);
    if (!membership) {
      return;
    }

    this.respondingJoinRequestUserIds.add(user.id);
    this.inviteModalMessage = '';
    this.inviteModalError = '';

    this.groupService.respondJoinRequest(this.group.id, membership.id, accept).subscribe(
      () => {
        this.respondingJoinRequestUserIds.delete(user.id);

        if (accept) {
          const updatedMembership = { ...membership, status: MembershipStatus.Accepted };
          this.invitationStatuses.set(user.id, MembershipStatus.Accepted);
          this.membershipsByUserId.set(user.id, updatedMembership);
          this.inviteModalMessage = this.languageService.translate('joinRequestAccepted');
          this.loadGroup(this.group!.id);
        } else {
          this.invitationStatuses.delete(user.id);
          this.membershipsByUserId.delete(user.id);
          this.inviteModalMessage = this.languageService.translate('joinRequestDeclined');
        }
      },
      (error) => {
        this.respondingJoinRequestUserIds.delete(user.id);
        this.inviteModalError = this.languageService.translate('joinRequestResponseError');
        console.error('Error responding to pending join request:', error);
      },
    );
  }

  getInviteLabel(user: User): string {
    if (this.isInviting(user) || this.isCancelingInvitation(user)) {
      return 'sendingInvitation';
    }

    const status = this.getInvitationStatus(user);

    if (status === MembershipStatus.Accepted) {
      return 'member';
    }

    if (status === MembershipStatus.PendingInvitation || status === MembershipStatus.PendingJoinRequest) {
      return 'pending';
    }

    return 'inviteUser';
  }

  isInviting(user: User): boolean {
    return !!user.id && this.invitingUserIds.has(user.id);
  }

  isCancelingInvitation(user: User): boolean {
    return !!user.id && this.cancelingInvitationUserIds.has(user.id);
  }

  isRespondingJoinRequest(user: User): boolean {
    return !!user.id && this.respondingJoinRequestUserIds.has(user.id);
  }

  isInvitationBlocked(user: User): boolean {
    return this.hasAnyActiveConnection(user);
  }

  isInviteActionDisabled(user: User): boolean {
    return this.isInviting(user)
      || this.isCancelingInvitation(user)
      || this.isRespondingJoinRequest(user)
      || this.isAcceptedMember(user);
  }

  canInviteUser(user: User): boolean {
    return !!this.group
      && !!user.id
      && !this.hasAnyActiveConnection(user)
      && !this.isInviting(user)
      && !this.isCancelingInvitation(user);
  }

  getInviteActionTitle(user: User): string {
    if (this.canCancelInvitation(user)) {
      return 'cancelInvitation';
    }

    if (this.canCancelPendingJoinRequest(user)) {
      return 'cancelJoinRequest';
    }

    return this.getInviteLabel(user);
  }

  getInviteActionIcon(user: User): string {
    const status = this.getInvitationStatus(user);

    if (status === MembershipStatus.PendingInvitation || status === MembershipStatus.PendingJoinRequest) {
      return 'bi-x-circle';
    }

    if (status === MembershipStatus.Accepted) {
      return 'bi-clock';
    }

    return 'bi-person-plus';
  }

  canCancelInvitation(user: User): boolean {
    return this.isPendingInvitation(user)
      && !this.isInviting(user)
      && !this.isCancelingInvitation(user);
  }

  canCancelPendingJoinRequest(user: User): boolean {
    return this.isPendingJoinRequest(user)
      && !!this.membershipsByUserId.get(user.id)
      && !this.isInviting(user)
      && !this.isCancelingInvitation(user)
      && !this.isRespondingJoinRequest(user);
  }

  canRespondToJoinRequest(user: User): boolean {
    return this.isPendingJoinRequest(user)
      && !!this.membershipsByUserId.get(user.id)
      && !this.isInviting(user)
      && !this.isCancelingInvitation(user)
      && !this.isRespondingJoinRequest(user);
  }

  canCancelPendingConnection(user: User): boolean {
    return this.canCancelInvitation(user);
  }

  cancelPendingConnection(user: User): void {
    if (this.canCancelInvitation(user)) {
      this.cancelInvitation(user);
      return;
    }
  }

  isPendingInvitation(user: User): boolean {
    return this.getInvitationStatus(user) === MembershipStatus.PendingInvitation;
  }

  isPendingJoinRequest(user: User): boolean {
    return this.getInvitationStatus(user) === MembershipStatus.PendingJoinRequest;
  }

  isAcceptedMember(user: User): boolean {
    return this.getInvitationStatus(user) === MembershipStatus.Accepted;
  }

  private hasAnyActiveConnection(user: User): boolean {
    return this.isPendingInvitation(user)
      || this.isPendingJoinRequest(user)
      || this.isAcceptedMember(user);
  }

  private resetViewStateForRouteChange(): void {
    this.group = null;
    this.selectedGroupToEdit = null;
    this.isRequestingAccess = false;
    this.isCancelingAccessRequest = false;
    this.isRespondingToInvitation = false;
    this.showEditGroupModal = false;
    this.showInviteMembersModal = false;
    this.showMembersModal = false;
    this.isMemberMenuOpen = false;
    this.removingMemberIds.clear();
    this.inviteSearchQuery = '';
    this.inviteUsers = [];
    this.invitationStatuses.clear();
    this.membershipsByUserId.clear();
    this.invitingUserIds.clear();
    this.cancelingInvitationUserIds.clear();
    this.respondingJoinRequestUserIds.clear();
    this.inviteModalMessage = '';
    this.inviteModalError = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  private loadGroup(groupId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.groupService.getGroupDetails(groupId).subscribe(
      (group) => {
        this.group = group;
        this.isMemberMenuOpen = false;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = this.languageService.translate('groupDetailsLoadError');
        console.error('Error loading group details:', error);
      },
    );
  }

  private respondToInvitation(accept: boolean): void {
    if (!this.group?.hasPendingInvitation || !this.group.pendingInvitationMembershipId || this.isRespondingToInvitation) {
      return;
    }

    this.isRespondingToInvitation = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.groupService.respondInvite(this.group.pendingInvitationMembershipId, accept, this.group.id).subscribe(
      () => {
        this.isRespondingToInvitation = false;
        this.successMessage = this.languageService.translate(accept ? 'invitationAccepted' : 'invitationDeclined');
        this.loadGroup(this.group!.id);
      },
      (error) => {
        this.isRespondingToInvitation = false;
        this.errorMessage = this.languageService.translate('invitationResponseError');
        console.error('Error responding to group invitation:', error);
      },
    );
  }

  private loadInvitationStatuses(): void {
    if (!this.group) {
      return;
    }

    this.invitationStatuses.clear();
    this.membershipsByUserId.clear();

    this.groupService.getGroupMemberships(this.group.id).subscribe(
      (memberships) => {
        memberships.forEach((membership) => {
          if (membership.userId && membership.status !== MembershipStatus.Declined) {
            this.invitationStatuses.set(membership.userId, membership.status);
            this.membershipsByUserId.set(membership.userId, membership);
          }
        });
      },
      (error) => {
        console.error('Error loading group memberships:', error);
      },
    );
  }

  private loadInviteUsers(query: string = ''): void {
    this.isLoadingInviteUsers = true;

    this.userService.searchUsers(query).subscribe(
      (users) => {
        this.inviteUsers = query.trim() ? users : this.pickInitialUsers(users);
        this.isLoadingInviteUsers = false;
      },
      (error) => {
        this.isLoadingInviteUsers = false;
        this.inviteModalError = this.languageService.translate('usersLoadError');
        console.error('Error loading invite users:', error);
      },
    );
  }

  private pickInitialUsers(users: User[]): User[] {
    return [...users]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
  }

  private getInvitationStatus(user: User): MembershipStatus | undefined {
    return user.id ? this.invitationStatuses.get(user.id) : undefined;
  }

  private toEditableGroup(group: GroupDetails): Group {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      grad: group.grad,
      kategorijaSporta: group.kategorijaSporta,
      adminId: '',
      imageUrl: group.imageUrl,
      createdAt: group.dateCreated,
      dateCreated: group.dateCreated,
      membersCount: group.membersCount,
    };
  }
}
