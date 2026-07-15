import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reservation } from '../../app/interfaces/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class AdminReservationService {
  private readonly apiUrl = `${environment.apiUrl}/admin/reservations`;

  constructor(private http: HttpClient) {}

  getAllReservations(filters?: {
    arenaId?: number;
    username?: string;
    status?: string;
  }): Observable<Reservation[]> {
    let params = new HttpParams();

    if (filters?.arenaId) {
      params = params.set('arenaId', filters.arenaId);
    }

    if (filters?.username?.trim()) {
      params = params.set('username', filters.username.trim());
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<Reservation[]>(this.apiUrl, { params });
  }

  cancelReservation(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel`, {});
  }
}
