import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../pipes/translate.pipe';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../interfaces/user';
import { ChooseGroupModalComponent } from '../choose-group-modal/choose-group-modal.component';
import { paginate } from '../helpers/pagination.helper';
import { PrivateChatService } from '../../services/private-chat.service';

@Component({
  selector: 'app-search-users',
  imports: [NgFor, NgIf, NavbarComponent, FormsModule, TranslatePipe, ChooseGroupModalComponent],
  templateUrl: './search-users.component.html',
  styleUrl: './search-users.component.scss'
})
export class SearchUsersComponent {
  searchQuery: string = '';
  users: User[] = [];
  currentUsername: string = '';
  selectedUserForGroupInvite: User | null = null;

  pagedUsers: User[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  totalPagesArray: number[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private privateChatService: PrivateChatService,
  ) {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.currentUsername = currentUser.username;
    }

    this.loadAllUsers();
  }

  loadAllUsers() {
    this.userService.searchUsers().subscribe(response => {
      this.users = response;
      this.setupPagination();
    });
  }

  searchUsers() {
    this.userService.searchUsers(this.searchQuery).subscribe(response => {
      this.users = response;
      this.setupPagination();
    });
  }

  setupPagination(): void {
    this.currentPage = 1;
    this.setPagedUsers();
  }

  setPagedUsers(): void {
    const pagination = paginate(this.users, this.currentPage, this.itemsPerPage);
    this.pagedUsers = pagination.pagedItems;
    this.totalPages = pagination.totalPages;
    this.totalPagesArray = pagination.totalPagesArray;
  }

  previousPage(event: Event): void {
    event.preventDefault();
    if (this.currentPage > 1) {
      this.currentPage--;
      this.setPagedUsers();
    }
  }

  nextPage(event: Event): void {
    event.preventDefault();
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.setPagedUsers();
    }
  }

  goToPage(page: number, event: Event): void {
    event.preventDefault();
    this.currentPage = page;
    this.setPagedUsers();
  }

  goToProfile(user: any): void {
    this.router.navigate(['/korisnicki-profil', user.username]);
  }

  viewProfile(event: Event, user: any): void {
    event.stopPropagation(); 
    if (user.username === this.currentUsername) {
      this.router.navigate(['/moj-profil']);
    } else {
      this.goToProfile(user);
    }
  }

  editProfile(event: Event, user: any): void {
    event.stopPropagation();
    if (user.username === this.currentUsername) {
      this.router.navigate(['/postavke-profila']);
    }
  }

  openChooseGroupModal(event: Event, user: User): void {
    event.stopPropagation();

    if (!user.id) {
      return;
    }

    this.selectedUserForGroupInvite = user;
  }

  openPrivateChat(event: Event, user: User): void {
    event.stopPropagation();

    if (user.id) {
      this.openConversationByUserId(user.id);
      return;
    }

    if (!user.username) {
      console.error('Cannot open private chat from user search because user id and username are missing.');
      return;
    }

    this.userService.getUserProfileByUsername(user.username).subscribe({
      next: (resolvedUser) => {
        if (!resolvedUser.id) {
          console.error('Cannot open private chat from user search because resolved user id is missing.');
          return;
        }

        this.openConversationByUserId(resolvedUser.id);
      },
      error: (error) => {
        console.error('Error resolving target user before opening private chat from user search:', error);
      },
    });
  }

  private openConversationByUserId(userId: string): void {
    this.privateChatService.getOrCreateConversation(userId).subscribe({
      next: (conversation) => {
        this.router.navigate(['/poruke/privatno', conversation.id]);
      },
      error: (error) => {
        console.error('Error opening private chat from user search:', error);
      },
    });
  }

  closeChooseGroupModal(): void {
    this.selectedUserForGroupInvite = null;
  }
}
