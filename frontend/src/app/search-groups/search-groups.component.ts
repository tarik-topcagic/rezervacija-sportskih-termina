import { Component, OnDestroy, OnInit } from '@angular/core';
import { Group } from '../interfaces/group.model';
import { GroupService } from '../../services/group.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CreateGroupModalComponent } from '../create-group-modal/create-group-modal.component';
import { EditGroupModalComponent } from '../edit-group-modal/edit-group-modal.component';
import { TranslatePipe } from '../pipes/translate.pipe';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-groups',
  imports: [NgIf, NgFor, NgClass, NavbarComponent, FormsModule, CreateGroupModalComponent, EditGroupModalComponent, TranslatePipe],
  templateUrl: './search-groups.component.html',
  styleUrl: './search-groups.component.scss'
})
export class SearchGroupsComponent implements OnDestroy {
  searchQuery: string = '';
  searchedGroups: Group[] = [];
  myGroups: Group[] = [];
  memberGroups: Group[] = [];
  showCreateGroupModal: boolean = false;
  showEditGroupModal: boolean = false;
  selectedGroupToEdit: Group | null = null;

  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 0;
  pagedGroups: any[] = [];
  totalPagesArray: number[] = [];
  private membershipChangedSubscription?: Subscription;

  constructor(private groupService: GroupService, private authService: AuthService, private router: Router) {
    this.membershipChangedSubscription = this.groupService.membershipChanged$.subscribe(() => {
      this.getMemberGroups();
      this.searchGroups();
    });
  }

  ngOnInit(): void {
    this.searchGroups();
    this.getMyGroups();
    this.getMemberGroups();
  }

  ngOnDestroy(): void {
    this.membershipChangedSubscription?.unsubscribe();
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

  onGroupCreated(newGroup: Group): void {
    this.getMyGroups();
    this.closeCreateGroupModal();
    window.location.reload();
  }

  openEditGroupModal(group: Group): void {
    this.selectedGroupToEdit = group;
    this.showEditGroupModal = true;
  }

  viewGroup(group: Group): void {
    this.router.navigate(['/grupe', group.id]);
  }

  closeEditGroupModal(): void {
    this.showEditGroupModal = false;
    this.selectedGroupToEdit = null;
    this.getMyGroups();
  }

  onGroupUpdated(updatedGroup: Group): void {
    this.getMyGroups();
    this.closeEditGroupModal();
    window.location.reload();
  }

  isMyGroup(group: Group): boolean {
    return this.myGroups.some(g => g.id === group.id);
  }

  isMemberGroup(group: Group): boolean {
    return this.memberGroups.some(g => g.id === group.id);
  }
}
