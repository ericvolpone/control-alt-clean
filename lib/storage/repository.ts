import type { Chore, ChoreInput } from '@/lib/types';

/**
 * Storage-agnostic contract for persisting chores.
 *
 * Every method is async (returns a Promise) on purpose: the current
 * implementation talks to localStorage synchronously, but a future SQL-backed
 * implementation (over HTTP, or a server action) will be async. Coding the UI
 * against this interface today means swapping in a real database later is a
 * one-line change in `./index.ts` — no component changes required.
 */
export interface ChoreRepository {
  /** Return all chores (unsorted; callers decide ordering). */
  getAll(): Promise<Chore[]>;

  /** Return a single chore by id, or null if it does not exist. */
  getById(id: string): Promise<Chore | null>;

  /** Create a new chore from editable input and return the stored entity. */
  create(input: ChoreInput): Promise<Chore>;

  /** Update an existing chore's editable fields and return the stored entity. */
  update(id: string, input: ChoreInput): Promise<Chore>;

  /** Permanently remove a chore. */
  remove(id: string): Promise<void>;

  /**
   * Mark a chore completed on the given date ("YYYY-MM-DD", defaults to today),
   * updating its lastCompletedDate. Returns the updated entity.
   */
  markDone(id: string, date?: string): Promise<Chore>;
}
