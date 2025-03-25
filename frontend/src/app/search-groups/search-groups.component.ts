import { Component, OnInit } from '@angular/core';
import { Group } from '../interfaces/group.model';
import { GroupService } from '../../services/group.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-search-groups',
  imports: [NgIf, NgFor, NavbarComponent, FormsModule],
  templateUrl: './search-groups.component.html',
  styleUrl: './search-groups.component.scss'
})
export class SearchGroupsComponent{
  searchQuery: string = '';
  searchedGroups: Group[] = [];
  myGroups: Group[] = [];
  memberGroups: Group[] = [];
  showCreateGroupModal: boolean = false;

  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 0;
  pagedGroups: any[] = [];
  totalPagesArray: number[] = [];

  constructor(private groupService: GroupService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.searchGroups();
    this.getMyGroups();
    this.getMemberGroups();
  }

  searchGroups(): void {
    this.groupService.searchGroups(this.searchQuery).subscribe(
      (groups) => {
        this.searchedGroups = groups;
        this.setupPagination();
      },
      error => console.error('Greška pri pretrazi grupa: ', error)
    );
  }

  setupPagination(): void {
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.searchedGroups.length / this.pageSize);
    this.setPagedGroups();
  }

  setPagedGroups(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedGroups = this.searchedGroups.slice(start, start + this.pageSize);
  }

  previousPage(event: Event): void {
    event.preventDefault();
    if (this.currentPage > 1) {
      this.currentPage--;
      this.setPagedGroups();
    }
  }
  
  nextPage(event: Event): void {
    event.preventDefault();
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.setPagedGroups();
    }
  }

  goToPage(page: number, event: Event): void {
    event.preventDefault();
    this.currentPage = page;
    this.setPagedGroups();
  }

  getTotalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getMyGroups(): void {
    this.groupService.getMyGroups().subscribe(
      (groups) => (this.myGroups = groups),
      (error) => console.error('Greška pri dohvatanju mojih grupa: ', error)
    )
  }

  getMemberGroups(): void {
    this.groupService.getMemberGroups().subscribe(
      (groups) => (this.memberGroups = groups),
      (error) => console.error('Greška pri dohvatanju grupa članstva: ', error) 
    )
  }

  openCreateGroupModal(): void {
    this.showCreateGroupModal = true;
  }

  closeCreateGroupModal(): void {
    this.showCreateGroupModal = false;
    this.getMyGroups();
  }

  isMyGroup(group: Group): boolean {
    return this.myGroups.some(g => g.id === group.id);
  }

  isMemberGroup(group: Group): boolean {
    return this.memberGroups.some(g => g.id === group.id);
  }
}
