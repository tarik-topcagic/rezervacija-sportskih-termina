function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

// Some locales (e.g. bs-BA) don't have full ICU short-month/weekday data in every
// environment and fall back to a raw pattern like "M07" instead of "Jul" - detect
// that and fall back to the English abbreviation so the label is never garbled.
export function getReadableMonthLabel(date: Date, locale: string): string {
  const localizedMonth = capitalize(
    new Intl.DateTimeFormat(locale, { month: 'short' }).format(date),
  );

  return /\d/.test(localizedMonth)
    ? new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
    : localizedMonth;
}

export function getReadableWeekdayLabel(date: Date, locale: string): string {
  const localizedWeekday = capitalize(
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
  );

  return /\d/.test(localizedWeekday)
    ? new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
    : localizedWeekday;
}

export function formatReadableDate(date: Date, locale: string): string {
  const month = getReadableMonthLabel(date, locale);
  const day = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date);
  const weekday = getReadableWeekdayLabel(date, locale);

  return `${month} ${day}, ${weekday}`;
}
