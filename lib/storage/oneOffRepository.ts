import type { OneOffChore } from '@/lib/types';

/**
 * Storage-agnostic contract for persisting one-off chores. Kept separate from
 * `ChoreRepository` because one-offs have a different shape and lifecycle
 * (no frequency; completed items expire). Async for the same reason: a future
 * SQL-backed implementation will be.
 */
export interface OneOffRepository {
  /** Return all one-offs, open and completed (unsorted). */
  getAll(): Promise<OneOffChore[]>;

  /** Create a new open one-off and return the stored entity. */
  create(title: string): Promise<OneOffChore>;

  /** Permanently remove a one-off. */
  remove(id: string): Promise<void>;

  /**
   * Mark a one-off completed on the given date ("YYYY-MM-DD", defaults to
   * today), or pass null to reopen it. Returns the updated entity.
   */
  setCompleted(id: string, date: string | null): Promise<OneOffChore>;

  /** Delete every completed one-off whose completedDate is before `cutoff`. */
  purgeCompletedBefore(cutoff: string): Promise<void>;
}
