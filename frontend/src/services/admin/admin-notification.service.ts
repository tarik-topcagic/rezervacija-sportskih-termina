import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppNotification } from '../../app/interfaces/notification.model';

@Injectable({
  providedIn: 'root',
})
export class AdminNotificationService {
  private readonly apiUrl = `${environment.apiUrl}/admin/notifications`;

  constructor(private http: HttpClient) {}

  getAllNotifications(filters?: {
    type?: string;
    isRead?: boolean;
    username?: string;
  }): Observable<AppNotification[]> {
    let params = new HttpParams();

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    if (filters?.isRead !== undefined) {
      params = params.set('isRead', filters.isRead);
    }

    if (filters?.username?.trim()) {
      params = params.set('username', filters.username.trim());
    }

    return this.http.get<AppNotification[]>(this.apiUrl, { params });
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
