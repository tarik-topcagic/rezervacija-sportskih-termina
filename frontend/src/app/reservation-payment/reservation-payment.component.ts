import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Arena } from '../interfaces/arena.model';
import { formatReadableDate } from '../helpers/date-format.helper';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../pipes/translate.pipe';
import { SkeletonTextBlockComponent } from '../skeleton/skeleton-text-block/skeleton-text-block.component';
import { ArenaService } from '../../services/arena.service';
import { LanguageService } from '../../services/language.service';
import { ReservationService } from '../../services/reservation.service';
import { ToastService } from '../../services/toast.service';

const ADDITIONAL_HALF_HOUR_PRICE = 10;

@Component({
  selector: 'app-reservation-payment',
  imports: [NgIf, FormsModule, NavbarComponent, TranslatePipe, SkeletonTextBlockComponent],
  templateUrl: './reservation-payment.component.html',
  styleUrl: './reservation-payment.component.scss',
})
export class ReservationPaymentComponent implements OnInit {
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

  arena: Arena | null = null;
  isLoading = true;
  isProcessing = false;
  errorMessage = '';

  arenaId = 0;
  startTime: Date | null = null;
  durationInHours = 1;

  cardholderName = '';
  cardNumber = '';
  expiry = '';
  cvv = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private arenaService: ArenaService,
    private languageService: LanguageService,
    private reservationService: ReservationService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParamMap;
    this.arenaId = Number(queryParams.get('arenaId'));
    const startTimeParam = queryParams.get('startTime');
    this.durationInHours = Number(queryParams.get('durationInHours')) || 1;

    if (!this.arenaId || !startTimeParam) {
      this.errorMessage = 'paymentMissingDetails';
      this.isLoading = false;
      return;
    }

    this.startTime = new Date(startTimeParam);

    this.arenaService.getArenaById(this.arenaId).subscribe({
      next: (arena) => {
        this.arena = arena;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading arena for payment:', error);
        this.errorMessage = error.status === 404 ? 'arenaNotFound' : 'arenaDetailsLoadError';
        this.isLoading = false;
      },
    });
  }

  get currentLocale(): string {
    return this.localeByLanguage[this.languageService.currentLanguage] || 'en-US';
  }

  get endTime(): Date | null {
    if (!this.startTime) {
      return null;
    }

    return new Date(this.startTime.getTime() + this.durationInHours * 3600000);
  }

  get totalPrice(): number {
    if (!this.arena) {
      return 0;
    }

    const extraHalfHours = Math.max(0, Math.round((this.durationInHours - 1) / 0.5));
    return this.arena.pricePerHour + extraHalfHours * ADDITIONAL_HALF_HOUR_PRICE;
  }

  formatDateTime(date: Date | null): string {
    if (!date) {
      return '';
    }

    return formatReadableDate(date, this.currentLocale);
  }

  formatTime(date: Date | null): string {
    if (!date) {
      return '';
    }

    return new Intl.DateTimeFormat(this.currentLocale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  formatPrice(amount: number): string {
    return `${new Intl.NumberFormat(this.currentLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)} BAM`;
  }

  submitPayment(form: NgForm): void {
    if (form.invalid || !this.startTime || this.isProcessing) {
      return;
    }

    const digitsOnly = this.cardNumber.replace(/\D/g, '');
    const cardLast4 = digitsOnly.slice(-4);

    this.isProcessing = true;

    this.reservationService
      .createReservation({
        arenaId: this.arenaId,
        startTime: this.startTime.toISOString(),
        durationInHours: this.durationInHours,
        cardLast4,
      })
      .subscribe({
        next: (reservation) => {
          this.isProcessing = false;
          this.router.navigate(['/sports-arenas', this.arenaId], {
            queryParams: { justBooked: reservation.id },
          });
        },
        error: (error) => {
          this.isProcessing = false;
          const message = error?.error?.message || error?.error || this.languageService.translate('paymentGenericError');
          this.toastService.showError(typeof message === 'string' ? message : this.languageService.translate('paymentGenericError'));
        },
      });
  }

  goBack(): void {
    if (this.arenaId) {
      this.router.navigate(['/sports-arenas', this.arenaId]);
    } else {
      this.router.navigate(['/sports-arenas']);
    }
  }
}
