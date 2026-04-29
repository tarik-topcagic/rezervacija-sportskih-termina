import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgIf } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { TranslatePipe } from '../pipes/translate.pipe';
import { ChooseGroupModalComponent } from '../choose-group-modal/choose-group-modal.component';
import { User } from '../interfaces/user';
import { AuthService } from '../../services/auth.service';
import { PrivateChatService } from '../../services/private-chat.service';

@Component({
  selector: 'app-user-profile',
  imports: [NgIf, NavbarComponent, TranslatePipe, RouterLink, ChooseGroupModalComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  userProfile: User | null = null;
  selectedUserForGroupInvite: User | null = null;
  timestamp: number = Date.now();
  isLoading = true;
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private privateChatService: PrivateChatService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.authService.currentUserValue?.id || null;
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.getUserProfile(username);
    }
  }

  getUserProfile(username: string): void {
    this.isLoading = true;
    const currentUsername = this.authService.currentUserValue?.username;
    const profileRequest = currentUsername && currentUsername.toLowerCase() === username.toLowerCase()
      ? this.userService.getMyProfile()
      : this.userService.getUserProfileByUsername(username);

    profileRequest.subscribe({
      next: (user) => {
        this.userProfile = user;
        this.isLoading = false;
      },
      error: (error) => {
        this.userProfile = null;
        this.isLoading = false;
        console.error('User not found', error);
      },
    });
  }

  handleImageError(): void {
    if (this.userProfile) {
      this.userProfile.profilePictureUrl = 'default-profile.png';
    }
  }

  openChooseGroupModal(): void {
    if (this.userProfile?.id) {
      this.selectedUserForGroupInvite = this.userProfile;
    }
  }

  closeChooseGroupModal(): void {
    this.selectedUserForGroupInvite = null;
  }

  isOwnProfile(): boolean {
    return !!this.userProfile?.id && !!this.currentUserId && this.userProfile.id === this.currentUserId;
  }

  openPrivateChat(): void {
    if (this.isOwnProfile()) {
      return;
    }

    if (this.userProfile?.id) {
      this.openConversationByUserId(this.userProfile.id);
      return;
    }

    const username = this.route.snapshot.paramMap.get('username');
    if (!username) {
      console.error('Cannot open private chat from user profile because username is missing.');
      return;
    }

    this.userService.getUserProfileByUsername(username).subscribe({
      next: (resolvedUser) => {
        if (!resolvedUser.id) {
          console.error('Cannot open private chat from user profile because resolved user id is missing.');
          return;
        }

        this.openConversationByUserId(resolvedUser.id);
      },
      error: (error) => {
        console.error('Error resolving target user before opening private chat from user profile:', error);
      },
    });
  }

  private openConversationByUserId(userId: string): void {
    this.privateChatService.getOrCreateConversation(userId).subscribe({
      next: (conversation) => {
        this.router.navigate(['/poruke/privatno', conversation.id]);
      },
      error: (error) => {
        console.error('Error opening private chat from user profile:', error);
      },
    });
  }
}
