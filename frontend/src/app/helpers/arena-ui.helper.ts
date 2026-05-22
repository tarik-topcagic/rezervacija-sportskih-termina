import { Arena } from '../interfaces/arena.model';

const ARENA_IMAGE_BY_ID: Record<number, string> = {
  1: 'images/arenas/football/arena-kosevo-center.png',
  4: 'images/arenas/football/velez-sport-park.png',
  7: 'images/arenas/football/tusanj-arena-5-plus.png',
  10: 'images/arenas/football/krajina-football-hub.png',
  13: 'images/arenas/football/una-football-point.png',
  16: 'images/arenas/football/bilino-football-arena.png',
  2: 'images/arenas/basketball/skenderija-basket-hall.png',
  5: 'images/arenas/basketball/neretva-basket-house.png',
  8: 'images/arenas/basketball/mejdan-basket-arena.png',
  11: 'images/arenas/basketball/borik-basket-zone.png',
  14: 'images/arenas/basketball/dvorana-sokol-basket.jpg',
  17: 'images/arenas/basketball/arena-kamberovica-basket.jpg',
  3: 'images/arenas/padel/padel-vista-marijin-dvor.jpg',
  6: 'images/arenas/padel/padel-club-buna.jpg',
  9: 'images/arenas/padel/padel-panonika.jpg',
  12: 'images/arenas/padel/padel-riverside-vrbas.jpg',
  15: 'images/arenas/padel/padel-una-gardens.jpg',
  18: 'images/arenas/padel/padel-city-zen.webp',
};

export function getArenaDisplayImage(arena: Arena): string {
  return ARENA_IMAGE_BY_ID[arena.id] || '';
}

export function getArenaDescriptionTranslationKey(arena: Arena): string {
  return `arenaDescription${arena.id}`;
}

export function getArenaGalleryImages(arena: Arena): string[] {
  const images = [getArenaDisplayImage(arena), arena.imageUrl].filter(Boolean);
  return Array.from(new Set(images));
}
