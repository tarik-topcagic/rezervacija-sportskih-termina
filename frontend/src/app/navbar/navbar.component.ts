import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { Subscription } from 'rxjs';
import { NotificationDropdownComponent } from '../notification-dropdown/notification-dropdown.component';
import { MessageDropdownComponent } from '../message-dropdown/message-dropdown.component';

@Component({
  selector: 'app-navbar',
  imports: [NgIf, NgClass, RouterModule, TranslatePipe, NotificationDropdownComponent, MessageDropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  username: string | null = null;
  isDropdownOpen = false;
  profileImageUrl: string | null = null;
  private currentUserSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUserSubscription = this.authService.currentUser.subscribe((user) => {
      this.username = user ? user.username : null;

      if (user) {
        this.getUserProfileImage();
      } else {
        this.profileImageUrl = null;
      }
    });
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

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeProfileDropdown(): void {
    const dropdownToggle = document.getElementById('userDropdown');
    const dropdownContainer = dropdownToggle?.closest('.dropdown');
    const dropdownMenu = dropdownContainer?.querySelector('.dropdown-menu');

    dropdownToggle?.setAttribute('aria-expanded', 'false');
    dropdownContainer?.classList.remove('show');
    dropdownMenu?.classList.remove('show');
    dropdownMenu?.removeAttribute('data-bs-popper');
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
