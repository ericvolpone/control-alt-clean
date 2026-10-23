/**
 * Domain types for Control Alt Clean.
 *
 * These are intentionally plain and serialisable so the same shapes map cleanly
 * onto a future SQL schema. Dates are stored as ISO date strings ("YYYY-MM-DD")
 * rather than Date objects so they round-trip through JSON (and a DB) without
 * timezone surprises.
 */

export type FrequencyUnit = 'days' | 'weeks';

/** Max sub-chores per chore, capped for UI reasons (see requirements). */
export const MAX_SUB_CHORES = 6;

export interface SubChore {
  id: string;
  title: string;
}

export interface Chore {
  id: string;
  title: string;
  /** How many `frequencyUnit`s between completions, e.g. 2 (weeks). */
  frequencyValue: number;
  frequencyUnit: FrequencyUnit;
  subChores: SubChore[];
  /**
   * The most recent date the chore was completed ("YYYY-MM-DD"), or null if it
   * has never been completed yet.
   */
  lastCompletedDate: string | null;
  /** ISO datetime the record was created. Used as the scheduling baseline when
   * the chore has never been completed. */
  createdAt: string;
  /** ISO datetime the record was last modified. */
  updatedAt: string;
}

/**
 * The editable fields of a chore. Sub-chore titles come in as plain strings;
 * the repository assigns stable ids. This is what forms produce and what
 * create/update accept — keeping the write surface separate from the stored
 * entity mirrors how an API/DTO layer would work against SQL.
 */
export interface ChoreInput {
  title: string;
  frequencyValue: number;
  frequencyUnit: FrequencyUnit;
  subChores: string[];
}

/**
 * A one-time chore with no frequency: it's either open or done. Completed
 * one-offs are kept as history for `ONE_OFF_HISTORY_MONTHS`, then purged.
 */
export interface OneOffChore {
  id: string;
  title: string;
  /** The date it was completed ("YYYY-MM-DD"), or null while still open. */
  completedDate: string | null;
  /** ISO datetime the record was created. */
  createdAt: string;
  /** ISO datetime the record was last modified. */
  updatedAt: string;
}

/** How long completed one-offs stay in the history before auto-deletion. */
export const ONE_OFF_HISTORY_MONTHS = 3;
