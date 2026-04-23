import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { Group } from '../interfaces/group.model';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-bottom-group-navbar',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './bottom-group-navbar.component.html',
  styleUrl: './bottom-group-navbar.component.scss',
})
export class BottomGroupNavbarComponent implements OnInit, OnDestroy {
  @ViewChild('groupScroller') groupScroller?: ElementRef<HTMLDivElement>;

  groups: Group[] = [];
  isDragging = false;
  private authSubscription?: Subscription;
  private membershipChangedSubscription?: Subscription;
  private pointerActive = false;
  private dragStartX = 0;
  private dragStartScrollLeft = 0;
  private dragDistance = 0;
  private suppressNextClick = false;
  private readonly dragClickThreshold = 12;

  constructor(
    private authService: AuthService,
    private groupService: GroupService,
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.loadGroups();
      } else {
        this.setGroups([]);
      }
    });

    this.membershipChangedSubscription = this.groupService.membershipChanged$.subscribe(() => {
      if (this.authService.currentUserValue) {
        this.loadGroups();
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.membershipChangedSubscription?.unsubscribe();
    document.body.classList.remove('bottom-groups-visible');
  }

  handleGroupClick(event: MouseEvent): void {
    if (this.suppressNextClick) {
      event.preventDefault();
      this.suppressNextClick = false;
    }
  }

  startDrag(event: PointerEvent): void {
    const scroller = this.groupScroller?.nativeElement;
    if (!scroller) {
      return;
    }

    this.pointerActive = true;
    this.isDragging = false;
    this.suppressNextClick = false;
    this.dragDistance = 0;
    this.dragStartX = event.clientX;
    this.dragStartScrollLeft = scroller.scrollLeft;
  }

  moveDrag(event: PointerEvent): void {
    const scroller = this.groupScroller?.nativeElement;
    if (!this.pointerActive || !scroller) {
      return;
    }

    const distance = event.clientX - this.dragStartX;
    this.dragDistance = Math.max(this.dragDistance, Math.abs(distance));

    if (!this.isDragging && this.dragDistance <= this.dragClickThreshold) {
      return;
    }

    this.isDragging = true;
    this.suppressNextClick = true;
    scroller.scrollLeft = this.dragStartScrollLeft - distance;
    event.preventDefault();
  }

  endDrag(event: PointerEvent): void {
    this.pointerActive = false;
    this.isDragging = false;

    if (this.suppressNextClick) {
      window.setTimeout(() => {
        this.suppressNextClick = false;
      }, 250);
    }
  }

  trackByGroupId(_: number, group: Group): number {
    return group.id;
  }

  private loadGroups(): void {
    forkJoin({
      adminGroups: this.groupService.getMyGroups().pipe(catchError(() => of([] as Group[]))),
      memberGroups: this.groupService.getMemberGroups().pipe(catchError(() => of([] as Group[]))),
    }).subscribe(({ adminGroups, memberGroups }) => {
      this.setGroups(this.mergeGroups(adminGroups, memberGroups));
    });
  }

  private setGroups(groups: Group[]): void {
    this.groups = groups;
    document.body.classList.toggle('bottom-groups-visible', groups.length > 0);
  }

  private mergeGroups(adminGroups: Group[], memberGroups: Group[]): Group[] {
    const groupsById = new Map<number, Group>();

    [...adminGroups, ...memberGroups].forEach((group) => {
      groupsById.set(group.id, group);
    });

    return Array.from(groupsById.values()).sort((first, second) => first.name.localeCompare(second.name));
  }
}
