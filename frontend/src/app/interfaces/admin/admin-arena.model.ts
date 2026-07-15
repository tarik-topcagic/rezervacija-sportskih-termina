import { Arena } from '../arena.model';

export interface AdminArenaDto extends Arena {
  reservationCount: number;
  favoriteCount: number;
}
