import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { PrivateConversation, PrivateMessage } from '../app/interfaces/private-chat.model';

@Injectable({
  providedIn: 'root',
})
export class PrivateChatService {
  private apiUrl = environment.apiUrl + '/private-chat';

  constructor(private http: HttpClient) {}

  getConversations(): Observable<PrivateConversation[]> {
    return this.http.get<PrivateConversation[]>(`${this.apiUrl}/conversations`);
  }

  getOrCreateConversation(userId: string): Observable<PrivateConversation> {
    return this.http.post<PrivateConversation>(`${this.apiUrl}/users/${encodeURIComponent(userId)}/conversation`, {});
  }

  getMessages(conversationId: number): Observable<PrivateMessage[]> {
    return this.http.get<PrivateMessage[]>(`${this.apiUrl}/conversations/${conversationId}/messages`);
  }

  sendMessageToUser(userId: string, messageText: string): Observable<PrivateMessage> {
    return this.http.post<PrivateMessage>(`${this.apiUrl}/users/${encodeURIComponent(userId)}/messages`, {
      messageText,
    });
  }

  sendMessageToConversation(conversationId: number, messageText: string): Observable<PrivateMessage> {
    return this.http.post<PrivateMessage>(`${this.apiUrl}/conversations/${conversationId}/messages`, {
      messageText,
    });
  }
}
