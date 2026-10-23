/**
 * Small date helpers that operate on local, date-only ISO strings ("YYYY-MM-DD").
 *
 * We deliberately avoid the Date(string) constructor for "YYYY-MM-DD" because it
 * parses as UTC midnight, which can shift the day in negative-offset timezones.
 * Parsing the parts explicitly keeps everything in the user's local day.
 */

/** Today's local date as "YYYY-MM-DD". */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Format a Date as a local "YYYY-MM-DD" string. */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parse a local "YYYY-MM-DD" string into a Date at local midnight. */
export function fromISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Add a number of days to a local ISO date, returning a new ISO date. */
export function addDays(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Whole-day difference `a - b` (positive when `a` is later than `b`). */
export function diffInDays(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const da = fromISODate(a).getTime();
  const db = fromISODate(b).getTime();
  return Math.round((da - db) / msPerDay);
}

/** Human-friendly date, e.g. "Mon, Oct 6". Falls back to the raw ISO on error. */
export function formatFriendlyDate(iso: string): string {
  try {
    return fromISODate(iso).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Add a number of calendar months to a local ISO date. Clamps to the last day
 * of the target month, so Nov 30 minus 3 months is Aug 30 and May 31 minus 3
 * months is Feb 28/29 rather than rolling into March.
 */
export function addMonths(iso: string, months: number): string {
  const date = fromISODate(iso);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toISODate(date);
}
