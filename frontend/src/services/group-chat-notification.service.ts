import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { GroupChatNotification } from '../app/interfaces/group-chat-notification.model';

@Injectable({
  providedIn: 'root',
})
export class GroupChatNotificationService {
  private apiUrl = environment.apiUrl + '/group-chat-notifications';
  private unreadCountRefreshSubject = new Subject<void>();
  unreadCountRefresh$ = this.unreadCountRefreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  getChatNotifications(): Observable<GroupChatNotification[]> {
    return this.http.get<GroupChatNotification[]>(this.apiUrl);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
  }

  markGroupAsRead(groupId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/mark-read`, {});
  }

  notifyUnreadCountChanged(): void {
    this.unreadCountRefreshSubject.next();
  }
}
