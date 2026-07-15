import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Group, UpdateGroupDto } from '../../app/interfaces/group.model';

@Injectable({
  providedIn: 'root',
})
export class AdminGroupService {
  private readonly apiUrl = `${environment.apiUrl}/admin/groups`;

  constructor(private http: HttpClient) {}

  getAllGroups(filters?: {
    name?: string;
    owner?: string;
  }): Observable<Group[]> {
    let params = new HttpParams();

    if (filters?.name?.trim()) {
      params = params.set('name', filters.name.trim());
    }

    if (filters?.owner?.trim()) {
      params = params.set('owner', filters.owner.trim());
    }

    return this.http.get<Group[]>(this.apiUrl, { params });
  }

  updateGroup(groupId: number, dto: UpdateGroupDto): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/${groupId}`, dto);
  }

  deleteGroup(groupId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}`);
  }

  removeMember(groupId: number, memberId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}/members/${encodeURIComponent(memberId)}`);
  }
}
