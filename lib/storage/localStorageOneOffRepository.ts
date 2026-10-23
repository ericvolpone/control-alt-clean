import type { OneOffChore } from '@/lib/types';
import type { OneOffRepository } from './oneOffRepository';
import { newId, nowISO } from './localStorageRepository';

const STORAGE_KEY = 'control-alt-clean.oneoffs.v1';

/**
 * A OneOffRepository backed by the browser's localStorage, stored as a single
 * JSON blob under its own key (separate from scheduled chores).
 */
export class LocalStorageOneOffRepository implements OneOffRepository {
  private read(): OneOffChore[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as OneOffChore[]) : [];
    } catch {
      return [];
    }
  }

  private write(items: OneOffChore[]): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage may be full or blocked (private mode). Fail quietly.
    }
  }

  async getAll(): Promise<OneOffChore[]> {
    return this.read();
  }

  async create(title: string): Promise<OneOffChore> {
    const items = this.read();
    const timestamp = nowISO();
    const item: OneOffChore = {
      id: newId(),
      title: title.trim(),
      completedDate: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    items.push(item);
    this.write(items);
    return item;
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((i) => i.id !== id));
  }

  async setCompleted(id: string, date: string | null): Promise<OneOffChore> {
    const items = this.read();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`One-off not found: ${id}`);

    const updated: OneOffChore = {
      ...items[index],
      completedDate: date,
      updatedAt: nowISO(),
    };
    items[index] = updated;
    this.write(items);
    return updated;
  }

  async purgeCompletedBefore(cutoff: string): Promise<void> {
    const items = this.read();
    // ISO date strings compare correctly as plain strings.
    const kept = items.filter(
      (i) => i.completedDate === null || i.completedDate >= cutoff,
    );
    if (kept.length !== items.length) this.write(kept);
  }
}
