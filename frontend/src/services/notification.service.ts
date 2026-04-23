import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { AppNotification } from '../app/interfaces/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = environment.apiUrl + '/notifications';
  private unreadCountRefreshSubject = new Subject<void>();
  unreadCountRefresh$ = this.unreadCountRefreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-all-read`, {});
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${notificationId}/read`, {});
  }

  notifyUnreadCountChanged(): void {
    this.unreadCountRefreshSubject.next();
  }
}
