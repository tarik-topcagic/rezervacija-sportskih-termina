import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  imports: [NgIf, NgClass, RouterModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, AfterViewInit {
  username: string | null = null;
  isDropdownOpen = false;
  profileImageUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      console.log('User from AuthService:', user);
      this.username = user ? user.username : null;
    });
    this.getUserProfileImage();
  }

  ngAfterViewInit(): void {
    const navbarCollapse = document.getElementById('navbarColor01');
    if (navbarCollapse) {
      navbarCollapse.addEventListener('hidden.bs.collapse', () => {
        this.isDropdownOpen = false;
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getUserProfileImage() {
    this.userService.getMyProfile().subscribe({
      next: (user) => {
        if (user.profilePictureUrl && user.profilePictureUrl !== 'default-profile.png') {
          this.profileImageUrl = user.profilePictureUrl;
        } else {
          this.profileImageUrl = null;
        }
      },
      error: (err) => {
        console.log('Greška pri dohvaćanju korisničke slike:', err);
        this.profileImageUrl = null;
      },
    });
  }
}
