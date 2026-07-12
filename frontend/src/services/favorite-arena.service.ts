import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { FavoriteArena } from '../app/interfaces/favorite-arena.model';

@Injectable({
  providedIn: 'root',
})
export class FavoriteArenaService {
  private readonly apiUrl = `${environment.apiUrl}/favorites`;

  private readonly favoriteArenaIdsSubject = new BehaviorSubject<Set<number>>(new Set<number>());
  readonly favoriteArenaIds$ = this.favoriteArenaIdsSubject.asObservable();

  constructor(private http: HttpClient) {}

  get favoriteArenaIds(): Set<number> {
    return this.favoriteArenaIdsSubject.value;
  }

  isFavorite(arenaId: number): boolean {
    return this.favoriteArenaIdsSubject.value.has(arenaId);
  }

  getMyFavorites(): Observable<FavoriteArena[]> {
    return this.http.get<FavoriteArena[]>(`${this.apiUrl}/mine`).pipe(
      tap((favorites) => {
        this.favoriteArenaIdsSubject.next(new Set(favorites.map((f) => f.arenaId)));
      }),
    );
  }

  addFavorite(arenaId: number): Observable<FavoriteArena> {
    return this.http.post<FavoriteArena>(`${this.apiUrl}/${arenaId}`, {}).pipe(
      tap(() => {
        const updated = new Set(this.favoriteArenaIdsSubject.value);
        updated.add(arenaId);
        this.favoriteArenaIdsSubject.next(updated);
      }),
    );
  }

  removeFavorite(arenaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${arenaId}`).pipe(
      tap(() => {
        const updated = new Set(this.favoriteArenaIdsSubject.value);
        updated.delete(arenaId);
        this.favoriteArenaIdsSubject.next(updated);
      }),
    );
  }
}
