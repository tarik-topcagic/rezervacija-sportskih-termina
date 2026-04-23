import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Group, GroupDetails, GroupMembershipState } from '../app/interfaces/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private apiUrl = environment.apiUrl + '/groups';
  private membershipChangedSubject = new Subject<void>();
  membershipChanged$ = this.membershipChangedSubject.asObservable();

  constructor(private http: HttpClient) {}

  createGroup(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/create`, data, { headers });
  }

  updateGroup(groupId: number, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${groupId}/update`, updateData);
  }

  getGroupDetails(groupId: number): Observable<GroupDetails> {
    return this.http.get<GroupDetails>(`${this.apiUrl}/${groupId}`);
  }

  requestToJoin(groupId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/join-request`, {});
  }

  sendInvite(groupId: number, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/invite`, { userId });
  }

  cancelInvitation(groupId: number, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}/invitations/${encodeURIComponent(userId)}`);
  }

  getGroupMemberships(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${groupId}/memberships`);
  }

  removeMember(groupId: number, memberId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}/members/${encodeURIComponent(memberId)}`).pipe(
      tap(() => this.notifyMembershipChanged()),
    );
  }

  cancelJoinRequest(groupId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}/join-request`);
  }

  respondInvite(membershipId: number, accept: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/respond-invite`, {
      membershipId,
      accept,
    }).pipe(
      tap(() => {
        if (accept) {
          this.notifyMembershipChanged();
        }
      }),
    );
  }

  respondJoinRequest(groupId: number, membershipId: number, accept: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/respond-request`, {
      membershipId,
      accept,
    });
  }

  getMyGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/admin`);
  }

  getMembershipStatusForAdminGroups(userId: string): Observable<GroupMembershipState[]> {
    return this.http.get<GroupMembershipState[]>(
      `${this.apiUrl}/admin/membership-status/${encodeURIComponent(userId)}`,
    );
  }

  getMemberGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/membership`);
  }

  searchGroups(query: string = ''): Observable<Group[]> {
    let url = `${this.apiUrl}/search-groups`;
    if (query.trim()) {
      url += `?query=${encodeURIComponent(query.trim())}`;
    }
    return this.http.get<any[]>(url);
  }

  uploadGroupPicture(groupId: number, formData: FormData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${groupId}/upload-group-picture`,
      formData,
    );
  }

  deleteGroupPicture(groupId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}/delete-group-picture`);
  }

  notifyMembershipChanged(): void {
    this.membershipChangedSubject.next();
  }
}
