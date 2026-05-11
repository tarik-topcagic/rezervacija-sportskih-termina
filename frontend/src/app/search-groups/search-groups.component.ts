import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Group } from '../interfaces/group.model';
import { GroupService } from '../../services/group.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { CreateGroupModalComponent } from '../create-group-modal/create-group-modal.component';
import { EditGroupModalComponent } from '../edit-group-modal/edit-group-modal.component';
import { TranslatePipe } from '../pipes/translate.pipe';
import { Router } from '@angular/router';
import { Subscription, catchError, forkJoin, of } from 'rxjs';
import { paginate } from '../helpers/pagination.helper';
import { matchesSearchQuery, SearchSortDirection, sortItemsByText } from '../helpers/search.helper';

@Component({
  selector: 'app-search-groups',
  imports: [NgIf, NgFor, NgClass, NavbarComponent, FormsModule, CreateGroupModalComponent, EditGroupModalComponent, TranslatePipe],
  templateUrl: './search-groups.component.html',
  styleUrl: './search-groups.component.scss',
})
export class SearchGroupsComponent implements OnInit, OnDestroy {
  searchQuery = '';
  filteredGroups: Group[] = [];
  allGroups: Group[] = [];
  myGroups: Group[] = [];
  memberGroups: Group[] = [];
  activeFilter: 'all' | 'admin' | 'membership' = 'admin';
  activeSort: SearchSortDirection = 'asc';
  showFilterMenu = false;
  showSortMenu = false;
  showCreateGroupModal = false;
  showEditGroupModal = false;
  selectedGroupToEdit: Group | null = null;
  isLoadingGroups = false;

  currentPage = 1;
  pageSize = 6;
  totalPages = 0;
  pagedGroups: Group[] = [];
  totalPagesArray: number[] = [];

  private membershipChangedSubscription?: Subscription;

  constructor(
    private groupService: GroupService,
    private router: Router,
  ) {
    this.membershipChangedSubscription = this.groupService.membershipChanged$.subscribe(() => {
      this.loadGroupCollections();
    });
  }

  ngOnInit(): void {
    this.loadGroupCollections();
  }

  ngOnDestroy(): void {
    this.membershipChangedSubscription?.unsubscribe();
  }

  searchGroups(): void {
    this.applyFiltersAndSort();
  }

  onSearchQueryChange(): void {
    this.applyFiltersAndSort();
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  toggleFilterMenu(event?: Event): void {
    event?.stopPropagation();
    this.showFilterMenu = !this.showFilterMenu;
    this.showSortMenu = false;
  }

  selectFilter(filter: 'all' | 'admin' | 'membership', event?: Event): void {
    event?.stopPropagation();
    this.activeFilter = filter;
    this.showFilterMenu = false;
    this.onFilterChange();
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  toggleSortMenu(event?: Event): void {
    event?.stopPropagation();
    this.showFilterMenu = false;
    this.showSortMenu = !this.showSortMenu;
  }

  selectSortDirection(direction: SearchSortDirection, event?: Event): void {
    event?.stopPropagation();
    this.activeSort = direction;
    this.showSortMenu = false;
    this.onSortChange();
  }

  @HostListener('document:click')
  closeSortMenu(): void {
    this.showFilterMenu = false;
    this.showSortMenu = false;
  }

  setupPagination(): void {
    this.currentPage = 1;
    this.setPagedGroups();
  }

  setPagedGroups(): void {
    const pagination = paginate(this.filteredGroups, this.currentPage, this.pageSize);
    this.pagedGroups = pagination.pagedItems;
    this.totalPages = pagination.totalPages;
    this.totalPagesArray = pagination.totalPagesArray;
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
    return this.totalPagesArray;
  }

  openCreateGroupModal(): void {
    this.showCreateGroupModal = true;
  }

  closeCreateGroupModal(): void {
    this.showCreateGroupModal = false;
    this.loadGroupCollections();
  }

  onGroupCreated(newGroup: Group): void {
    this.loadGroupCollections();
    this.closeCreateGroupModal();
  }

  openEditGroupModal(group: Group): void {
    this.selectedGroupToEdit = group;
    this.showEditGroupModal = true;
  }

  viewGroup(group: Group): void {
    this.router.navigate(['/groups', group.id]);
  }

  openGroupChat(event: Event, group: Group): void {
    event.stopPropagation();
    this.router.navigate(['/groups', group.id, 'chat'], { fragment: 'chat-composer-anchor' });
  }

  closeEditGroupModal(): void {
    this.showEditGroupModal = false;
    this.selectedGroupToEdit = null;
    this.loadGroupCollections();
  }

  onGroupUpdated(updatedGroup: Group): void {
    this.loadGroupCollections();
    this.closeEditGroupModal();
  }

  onGroupDeleted(): void {
    this.closeEditGroupModal();
  }

  isMyGroup(group: Group): boolean {
    return this.myGroups.some((candidate) => candidate.id === group.id);
  }

  canMessageGroup(group: Group): boolean {
    return this.myGroups.some((candidate) => candidate.id === group.id)
      || this.memberGroups.some((candidate) => candidate.id === group.id);
  }

  getEmptyStateKey(): string {
    if (this.activeFilter === 'all') {
      return 'noGroupsFound';
    }

    return this.activeFilter === 'admin' ? 'noAdminGroups' : 'noMemberGroups';
  }

  private loadGroupCollections(): void {
    this.isLoadingGroups = true;

    forkJoin({
      allGroups: this.groupService.searchGroups().pipe(catchError(() => of([] as Group[]))),
      adminGroups: this.groupService.getMyGroups().pipe(catchError(() => of([] as Group[]))),
      memberGroups: this.groupService.getMemberGroups().pipe(catchError(() => of([] as Group[]))),
    }).subscribe({
      next: ({ allGroups, adminGroups, memberGroups }) => {
        this.myGroups = adminGroups;
        this.memberGroups = memberGroups;
        this.allGroups = this.mergeUniqueGroups(allGroups, adminGroups, memberGroups);

        if (!this.myGroups.length && !this.memberGroups.length) {
          this.activeFilter = 'all';
        } else if (this.activeFilter === 'all') {
          this.activeFilter = this.myGroups.length ? 'admin' : 'membership';
        } else if (this.activeFilter === 'admin' && !this.myGroups.length && this.memberGroups.length) {
          this.activeFilter = 'membership';
        }

        this.isLoadingGroups = false;
        this.applyFiltersAndSort();
      },
      error: (error) => {
        console.error('Error loading group collections for search groups page:', error);
        this.allGroups = [];
        this.myGroups = [];
        this.memberGroups = [];
        this.isLoadingGroups = false;
        this.applyFiltersAndSort();
      },
    });
  }

  private mergeUniqueGroups(...groupCollections: Group[][]): Group[] {
    const uniqueGroups = new Map<number, Group>();

    groupCollections.flat().forEach((group) => {
      uniqueGroups.set(group.id, group);
    });

    return Array.from(uniqueGroups.values());
  }

  private applyFiltersAndSort(): void {
    const sourceGroups =
      this.activeFilter === 'all'
        ? this.allGroups
        : this.activeFilter === 'admin'
          ? this.myGroups
          : this.memberGroups;

    let nextGroups = sourceGroups.filter((group) =>
      matchesSearchQuery(
        [
        group.name,
        group.description,
        group.grad,
        group.kategorijaSporta,
        ],
        this.searchQuery,
      ),
    );

    nextGroups = sortItemsByText(nextGroups, (group) => group.name, this.activeSort);

    this.filteredGroups = nextGroups;
    this.setupPagination();
  }
}
