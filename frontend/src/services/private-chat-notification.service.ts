import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';
import { PrivateChatNotification } from '../app/interfaces/private-chat-notification.model';

@Injectable({
  providedIn: 'root',
})
export class PrivateChatNotificationService {
  private apiUrl = environment.apiUrl + '/private-chat-notifications';
  private unreadCountRefreshSubject = new Subject<void>();
  unreadCountRefresh$ = this.unreadCountRefreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  getChatNotifications(): Observable<PrivateChatNotification[]> {
    return this.http.get<PrivateChatNotification[]>(this.apiUrl);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
  }

  markConversationAsRead(conversationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${conversationId}/mark-read`, {});
  }

  notifyUnreadCountChanged(): void {
    this.unreadCountRefreshSubject.next();
  }
}
