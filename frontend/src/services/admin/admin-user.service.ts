import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminUserDto } from '../../app/interfaces/admin/admin-user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(filters?: {
    username?: string;
    role?: string;
    locked?: boolean;
  }): Observable<AdminUserDto[]> {
    let params = new HttpParams();

    if (filters?.username?.trim()) {
      params = params.set('username', filters.username.trim());
    }

    if (filters?.role) {
      params = params.set('role', filters.role);
    }

    if (filters?.locked !== undefined) {
      params = params.set('locked', filters.locked);
    }

    return this.http.get<AdminUserDto[]>(this.apiUrl, { params });
  }

  lockUser(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${encodeURIComponent(id)}/lock`, {});
  }

  unlockUser(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${encodeURIComponent(id)}/unlock`, {});
  }
}
