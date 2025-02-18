import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../interfaces/user';
import { NgIf } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [NgIf, NavbarComponent, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  userProfile: User | null = null;
  timestamp = Date.now();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.timestamp = Date.now();
    this.userService.getMyProfile().subscribe({
      next: (data) => (this.userProfile = data),
      error: (err) => console.log('Greska pri dohvacanju profila', err),
    });
  }

  handleImageError(): void {
    if (this.userProfile) {
      this.userProfile.profilePictureUrl = null;
    }
  }
}
