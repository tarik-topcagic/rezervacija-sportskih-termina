import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationTimeService {
  private readonly minuteInMs = 60 * 1000;
  private readonly hourInMinutes = 60;
  private readonly dayInHours = 24;

  constructor(private languageService: LanguageService) {}

  formatRelativeTime(createdAt: string | Date): string {
    const createdAtTime = this.parseNotificationDate(createdAt).getTime();

    if (Number.isNaN(createdAtTime)) {
      return '';
    }

    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - createdAtTime) / this.minuteInMs));

    if (elapsedMinutes < 1) {
      return this.languageService.translate('justNow');
    }

    if (elapsedMinutes < this.hourInMinutes) {
      return this.interpolate('minutesAgo', { count: elapsedMinutes.toString() });
    }

    const elapsedHours = Math.floor(elapsedMinutes / this.hourInMinutes);

    if (elapsedHours < this.dayInHours) {
      return this.interpolate('hoursAgo', { count: elapsedHours.toString() });
    }

    const elapsedDays = Math.floor(elapsedHours / this.dayInHours);
    return this.interpolate('daysAgo', { count: elapsedDays.toString() });
  }

  private parseNotificationDate(value: string | Date): Date {
    if (value instanceof Date) {
      return value;
    }

    const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
    return new Date(hasTimezone ? value : `${value}Z`);
  }

  private interpolate(key: string, values: Record<string, string>): string {
    return Object.entries(values).reduce(
      (text, [name, value]) => text.replace(`{${name}}`, value),
      this.languageService.translate(key),
    );
  }
}
