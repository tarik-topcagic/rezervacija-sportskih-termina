import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { CreateReservationRequest, Reservation } from '../app/interfaces/reservation.model';
import { TimeRange } from '../app/interfaces/availability.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly reservationsUrl = `${environment.apiUrl}/reservations`;
  private readonly arenasUrl = `${environment.apiUrl}/arenas`;

  constructor(private http: HttpClient) {}

  createReservation(request: CreateReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.reservationsUrl, request);
  }

  cancelReservation(id: number): Observable<any> {
    return this.http.delete(`${this.reservationsUrl}/${id}/cancel`);
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.reservationsUrl}/mine`);
  }

  getAvailability(arenaId: number, date: string): Observable<TimeRange[]> {
    return this.http.get<TimeRange[]>(`${this.arenasUrl}/${arenaId}/availability`, {
      params: { date },
    });
  }
}
