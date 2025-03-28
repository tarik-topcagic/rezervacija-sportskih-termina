import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../app/interfaces/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private apiUrl = environment.apiUrl + '/groups';

  constructor(private http: HttpClient) {}

  createGroup(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/create`, data, { headers });
  }

  updateGroup(groupId: number, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${groupId}/update`, updateData);
  }

  requestToJoin(groupId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/join-request`, {});
  }

  sendInvite(groupId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/invite`, { userId });
  }

  respondInvite(membershipId: number, accept: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/respond-invite`, {
      membershipId,
      accept,
    });
  }

  respondJoinRequest(groupId: number, membershipId: number, accept: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/respond-request`, {
      membershipId,
      accept,
    });
  }

  getMyGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/admin`);
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
}
