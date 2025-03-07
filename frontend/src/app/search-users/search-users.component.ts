import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-search-users',
  imports: [NgFor, NgIf, NavbarComponent, FormsModule],
  templateUrl: './search-users.component.html',
  styleUrl: './search-users.component.scss'
})
export class SearchUsersComponent {
  searchQuery: string = '';
  users: any[] = [];
  pagedUsers: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  constructor(private userService: UserService) {
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
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    this.setPagedUsers();
  }

  setPagedUsers(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.pagedUsers = this.users.slice(start, start + this.itemsPerPage);
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

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
