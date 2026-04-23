import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgIf } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { TranslatePipe } from '../pipes/translate.pipe';
import { ChooseGroupModalComponent } from '../choose-group-modal/choose-group-modal.component';
import { User } from '../interfaces/user';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
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
}
