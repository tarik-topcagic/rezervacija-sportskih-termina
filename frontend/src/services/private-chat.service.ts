import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { PrivateConversation, PrivateMessage } from '../app/interfaces/private-chat.model';
import { MessageReaction } from '../app/interfaces/message-reaction.model';

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

  sendMessageToConversation(conversationId: number, messageText: string, replyToMessageId?: number | null): Observable<PrivateMessage> {
    return this.http.post<PrivateMessage>(`${this.apiUrl}/conversations/${conversationId}/messages`, {
      messageText,
      replyToMessageId,
    });
  }

  deletePrivateMessage(conversationId: number, messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/conversations/${conversationId}/messages/${messageId}`);
  }

  setPrivateMessagePinned(conversationId: number, messageId: number, isPinned: boolean): Observable<{ isPinned: boolean; pinnedAt: string | null }> {
    return this.http.post<{ isPinned: boolean; pinnedAt: string | null }>(
      `${this.apiUrl}/conversations/${conversationId}/messages/${messageId}/pin`,
      { isPinned },
    );
  }

  addOrUpdatePrivateMessageReaction(conversationId: number, messageId: number, emoji: string): Observable<MessageReaction[]> {
    return this.http.post<MessageReaction[]>(
      `${this.apiUrl}/conversations/${conversationId}/messages/${messageId}/reactions`,
      { emoji },
    );
  }

  removePrivateMessageReaction(conversationId: number, messageId: number): Observable<MessageReaction[]> {
    return this.http.delete<MessageReaction[]>(`${this.apiUrl}/conversations/${conversationId}/messages/${messageId}/reactions`);
  }
}
