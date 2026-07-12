export type ReservationStatus = 'Confirmed' | 'Cancelled';

export interface Reservation {
  id: number;
  arenaId: number;
  arenaName: string;
  userId: string;
  startTime: string;
  endTime: string;
  durationInHours: number;
  status: ReservationStatus;
  cardLast4?: string | null;
  createdAt: string;
  cancelledAt?: string | null;
}

export interface CreateReservationRequest {
  arenaId: number;
  startTime: string;
  durationInHours: number;
  cardLast4: string;
}
