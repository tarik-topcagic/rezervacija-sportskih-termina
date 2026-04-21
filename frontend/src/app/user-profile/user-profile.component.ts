import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NgIf } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-user-profile',
  imports: [NgIf, NavbarComponent, TranslatePipe],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  userProfile: any; 
  timestamp: number = Date.now();

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.getUserProfile(username);
    }
  }

  getUserProfile(username: string): void {
    this.userService.searchUsers(username).subscribe(users => {
      const matchedUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (matchedUser) {
        this.userProfile = matchedUser;
      } else {
        console.error('User not found');
      }
    });
  }

  handleImageError(): void {
    if (this.userProfile) {
      this.userProfile.profilePictureUrl = 'default-profile.png';
    }
  }
}
