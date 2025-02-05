import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [NgIf, NgClass],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {
  username: string | null = null;
  isDropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      console.log('User from AuthService:', user);
      this.username = user ? user.username : null;
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
    this.router.navigate([""]); 
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}







