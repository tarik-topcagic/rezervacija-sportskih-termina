import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { GroupPresence } from '../app/interfaces/group-presence.model';
import { UserPresence } from '../app/interfaces/user-presence.model';
import { ChatRealtimeService } from './chat-realtime.service';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  private readonly apiUrl = environment.apiUrl + '/presence';
  readonly presenceUpdates$: Observable<UserPresence>;

  constructor(
    private http: HttpClient,
    private chatRealtimeService: ChatRealtimeService,
  ) {
    this.presenceUpdates$ = this.chatRealtimeService.incomingPresenceUpdates$;
  }

  async connectRealtime(): Promise<void> {
    await this.chatRealtimeService.connect();
  }

  async disconnectRealtime(): Promise<void> {
    await this.chatRealtimeService.disconnect();
  }

  getUserPresence(userId: string): Observable<UserPresence> {
    return this.http.get<UserPresence>(`${this.apiUrl}/users/${encodeURIComponent(userId)}`);
  }

  getGroupPresence(groupId: number): Observable<GroupPresence> {
    return this.http.get<GroupPresence>(`${this.apiUrl}/groups/${groupId}`);
  }
}
