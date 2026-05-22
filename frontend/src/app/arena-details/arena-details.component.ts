import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getArenaDescriptionTranslationKey,
  getArenaGalleryImages,
  getArenaDisplayImage,
} from '../helpers/arena-ui.helper';
import { Arena } from '../interfaces/arena.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../pipes/translate.pipe';
import { ArenaService } from '../../services/arena.service';
import { LanguageService } from '../../services/language.service';

interface ReservationDay {
  index: number;
  date: Date;
}

@Component({
  selector: 'app-arena-details',
  imports: [NgIf, NgFor, NgClass, NavbarComponent, TranslatePipe],
  templateUrl: './arena-details.component.html',
  styleUrl: './arena-details.component.scss',
})
export class ArenaDetailsComponent implements OnInit {
  private readonly localeByLanguage: Record<string, string> = {
    en: 'en-US',
    de: 'de-DE',
    bs: 'bs-BA',
    hr: 'hr-HR',
    sr: 'sr-Latn-RS',
    es: 'es-ES',
    fr: 'fr-FR',
    it: 'it-IT',
  };
  private readonly hourlyRateBySport: Record<string, number> = {
    Football: 50,
    Basketball: 42,
    Padel: 36,
  };

  arena: Arena | null = null;
  isLoading = true;
  errorMessage = '';
  showFullWeek = false;
  selectedDateIndex = 0;
  selectedSlotStart: number | null = null;
  isGalleryOpen = false;
  activeGalleryIndex = 0;
  galleryImageUrls: string[] = [];
  isMobileSummaryOpen = false;
  viewportWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1280;

  readonly timeSlots = Array.from({ length: 16 }, (_, index) => index + 7);
  readonly reservationDays = this.createReservationDays();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private arenaService: ArenaService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.initializeMockSelection();
    const arenaId = Number(this.route.snapshot.paramMap.get('id'));

    if (!arenaId) {
      this.errorMessage = 'arenaNotFound';
      this.isLoading = false;
      return;
    }

    this.arenaService.getArenaById(arenaId).subscribe({
      next: async (arena) => {
        this.arena = arena;
        this.galleryImageUrls = await this.resolveGalleryImages(arena);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading arena details:', error);
        this.errorMessage =
          error.status === 404 ? 'arenaNotFound' : 'arenaDetailsLoadError';
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sports-arenas']);
  }

  getArenaImageUrl(): string {
    return this.arena ? getArenaDisplayImage(this.arena) : '';
  }

  getArenaDescription(): string {
    return this.arena ? getArenaDescriptionTranslationKey(this.arena) : '';
  }

  get visibleDays(): ReservationDay[] {
    return this.showFullWeek
      ? this.reservationDays
      : this.reservationDays.slice(0, 5);
  }

  get selectedDay(): ReservationDay | null {
    return this.reservationDays[this.selectedDateIndex] ?? null;
  }

  get estimatedPrice(): number {
    return this.hourlyRateBySport[this.arena?.sportType || ''] ?? 40;
  }

  get currentLocale(): string {
    return this.localeByLanguage[this.languageService.currentLanguage] || 'en-US';
  }

  get isMobileLayout(): boolean {
    return this.viewportWidth <= 767.98;
  }

  get galleryImages(): string[] {
    return this.galleryImageUrls;
  }

  get activeGalleryImage(): string {
    return this.galleryImages[this.activeGalleryIndex] || this.getArenaImageUrl();
  }

  toggleWeekView(): void {
    this.showFullWeek = !this.showFullWeek;
  }

  openGallery(startIndex = 0): void {
    if (!this.galleryImages.length) {
      return;
    }

    this.activeGalleryIndex = Math.min(
      Math.max(startIndex, 0),
      this.galleryImages.length - 1,
    );
    this.isGalleryOpen = true;
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
  }

  openMobileSummary(): void {
    if (this.isMobileLayout && this.selectedSlotStart !== null) {
      this.isMobileSummaryOpen = true;
    }
  }

  closeMobileSummary(): void {
    this.isMobileSummaryOpen = false;
  }

  showPreviousImage(): void {
    if (this.galleryImages.length < 2) {
      return;
    }

    this.activeGalleryIndex =
      (this.activeGalleryIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  showNextImage(): void {
    if (this.galleryImages.length < 2) {
      return;
    }

    this.activeGalleryIndex = (this.activeGalleryIndex + 1) % this.galleryImages.length;
  }

  selectDay(dayIndex: number): void {
    this.selectedDateIndex = dayIndex;

    if (
      this.selectedSlotStart !== null &&
      !this.isSlotAvailable(dayIndex, this.selectedSlotStart)
    ) {
      this.selectedSlotStart =
        this.timeSlots.find((slot) => this.isSlotAvailable(dayIndex, slot)) ?? null;
    }
  }

  selectSlot(dayIndex: number, slotStart: number): void {
    if (!this.isSlotAvailable(dayIndex, slotStart)) {
      return;
    }

    this.selectedDateIndex = dayIndex;
    this.selectedSlotStart = slotStart;

    if (this.isMobileLayout) {
      this.isMobileSummaryOpen = true;
    }
  }

  isSlotAvailable(dayIndex: number, slotStart: number): boolean {
    const slotIndex = slotStart - this.timeSlots[0];
    const isPeakHour = slotStart >= 18 && slotStart <= 21;
    return (dayIndex + slotIndex + (isPeakHour ? 2 : 1)) % (isPeakHour ? 4 : 6) !== 0;
  }

  isSelectedSlot(dayIndex: number, slotStart: number): boolean {
    return this.selectedDateIndex === dayIndex && this.selectedSlotStart === slotStart;
  }

  formatDayLabel(date: Date): string {
    if (this.isSameDay(date, new Date())) {
      return this.languageService.translate('today');
    }

    return this.capitalize(
      new Intl.DateTimeFormat(this.currentLocale, {
        weekday: 'short',
      }).format(date),
    );
  }

  formatDayDate(date: Date): string {
    const month = this.getReadableMonthLabel(date);
    const day = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
    }).format(date);

    return `${month} ${day}`;
  }

  formatFullDate(date: Date | null): string {
    if (!date) {
      return this.languageService.translate('notSelected');
    }

    const month = this.getReadableMonthLabel(date);
    const day = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
    }).format(date);
    const weekday = this.getReadableWeekdayLabel(date);

    return `${month} ${day}, ${weekday}`;
  }

  formatTimeLabel(slotStart: number): string {
    return `${String(slotStart).padStart(2, '0')}:00`;
  }

  formatTimeRange(slotStart: number | null): string {
    if (slotStart === null) {
      return this.languageService.translate('notSelected');
    }

    return `${this.formatTimeLabel(slotStart)} - ${this.formatTimeLabel(slotStart + 1)}`;
  }

  formatPrice(amount: number): string {
    return `${new Intl.NumberFormat(this.currentLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)} BAM`;
  }

  getScheduleGridTemplate(): string {
    if (this.isMobileLayout) {
      return `56px repeat(${this.visibleDays.length}, 132px)`;
    }

    return `88px repeat(${this.visibleDays.length}, minmax(140px, 1fr))`;
  }

  trackDay(index: number, day: ReservationDay): number {
    return day.index;
  }

  trackTime(index: number, slotStart: number): number {
    return slotStart;
  }

  trackImage(index: number, imageUrl: string): string {
    return imageUrl;
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    if (this.isGalleryOpen) {
      this.closeGallery();
      return;
    }

    if (this.isMobileSummaryOpen) {
      this.closeMobileSummary();
    }
  }

  @HostListener('window:resize')
  handleResize(): void {
    this.viewportWidth = window.innerWidth;

    if (!this.isMobileLayout) {
      this.isMobileSummaryOpen = false;
    }
  }

  private createReservationDays(): ReservationDay[] {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);

      return {
        index,
        date,
      };
    });
  }

  private initializeMockSelection(): void {
    this.selectedSlotStart = null;
    this.isMobileSummaryOpen = false;
  }

  private async resolveGalleryImages(arena: Arena): Promise<string[]> {
    const candidates = getArenaGalleryImages(arena);
    const results = await Promise.all(
      candidates.map(async (imageUrl) => ({
        imageUrl,
        isValid: await this.canLoadImage(imageUrl),
      })),
    );

    const validImages = results
      .filter((result) => result.isValid)
      .map((result) => result.imageUrl);

    return validImages.length ? validImages : [getArenaDisplayImage(arena)].filter(Boolean);
  }

  private canLoadImage(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = imageUrl;
    });
  }

  private isSameDay(left: Date, right: Date): boolean {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }

  private capitalize(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  }

  private getReadableMonthLabel(date: Date): string {
    const localizedMonth = this.capitalize(
      new Intl.DateTimeFormat(this.currentLocale, {
        month: 'short',
      }).format(date),
    );

    return /\d/.test(localizedMonth)
      ? new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
      : localizedMonth;
  }

  private getReadableWeekdayLabel(date: Date): string {
    const localizedWeekday = this.capitalize(
      new Intl.DateTimeFormat(this.currentLocale, {
        weekday: 'short',
      }).format(date),
    );

    return /\d/.test(localizedWeekday)
      ? new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
      : localizedWeekday;
  }
}
