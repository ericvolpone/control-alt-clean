import type { Chore } from '@/lib/types';
import { addDays, diffInDays, todayISO } from '@/lib/date';

export type ChoreStatus = 'green' | 'yellow' | 'red';

/** The chore's frequency expressed in whole days. */
export function frequencyInDays(chore: Chore): number {
  const multiplier = chore.frequencyUnit === 'weeks' ? 7 : 1;
  return chore.frequencyValue * multiplier;
}

/**
 * The scheduling baseline: the last time it was completed, or — if never
 * completed — the day it was created, so a brand-new chore is due one frequency
 * after you added it.
 */
function baselineDate(chore: Chore): string {
  if (chore.lastCompletedDate) return chore.lastCompletedDate;
  return chore.createdAt.slice(0, 10);
}

/**
 * The date the chore is next due: most recent completion (or creation) plus the
 * frequency. May be in the past (overdue) or the future.
 */
export function targetDate(chore: Chore): string {
  return addDays(baselineDate(chore), frequencyInDays(chore));
}

/** Whole days until the target date. Negative means overdue. */
export function daysRemaining(chore: Chore, today: string = todayISO()): number {
  return diffInDays(targetDate(chore), today);
}

/** Days remaining as a fraction of the full frequency (1 = a fresh full cycle). */
export function remainingFraction(chore: Chore, today: string = todayISO()): number {
  const freq = frequencyInDays(chore);
  if (freq <= 0) return 0;
  return daysRemaining(chore, today) / freq;
}

/**
 * Tile colour:
 *  - red    → overdue (remaining < 0)
 *  - yellow → due soon (0% – 25% of the frequency remaining)
 *  - green  → plenty of time (>= 25% remaining)
 */
export function choreStatus(chore: Chore, today: string = todayISO()): ChoreStatus {
  const fraction = remainingFraction(chore, today);
  if (fraction < 0) return 'red';
  if (fraction < 0.25) return 'yellow';
  return 'green';
}

export interface RemainingDisplay {
  /** Signed whole number shown on the tile, e.g. +2 or -1. */
  value: number;
  /** "d" or "wk", matching the chore's own frequency unit. */
  unit: 'd' | 'wk';
  /** Longer label for accessibility, e.g. "2 weeks left" / "1 day overdue". */
  label: string;
}

/**
 * The +/- indicator, expressed in the chore's own unit (days for day-frequency
 * chores, weeks for week-frequency chores).
 */
export function remainingDisplay(
  chore: Chore,
  today: string = todayISO(),
): RemainingDisplay {
  const days = daysRemaining(chore, today);
  const inWeeks = chore.frequencyUnit === 'weeks';
  const value = inWeeks ? Math.round(days / 7) : days;
  const unit: 'd' | 'wk' = inWeeks ? 'wk' : 'd';

  const noun = inWeeks
    ? Math.abs(value) === 1
      ? 'week'
      : 'weeks'
    : Math.abs(value) === 1
      ? 'day'
      : 'days';

  let label: string;
  if (days < 0) label = `${Math.abs(value)} ${noun} overdue`;
  else if (days === 0) label = 'Due today';
  else label = `${value} ${noun} left`;

  return { value, unit, label };
}

/** Human-readable frequency, e.g. "every 2 weeks" or "every day". */
export function frequencyLabel(chore: Chore): string {
  const { frequencyValue, frequencyUnit } = chore;
  const singular = frequencyUnit === 'weeks' ? 'week' : 'day';
  if (frequencyValue === 1) return `every ${singular}`;
  return `every ${frequencyValue} ${frequencyUnit}`;
}
