import type { Chore, ChoreInput, SubChore } from '@/lib/types';
import { MAX_SUB_CHORES } from '@/lib/types';
import { todayISO } from '@/lib/date';
import type { ChoreRepository } from './repository';

const STORAGE_KEY = 'control-alt-clean.chores.v1';

/** Generate a reasonably unique id. Uses crypto.randomUUID when available. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

/** Normalise form input into stored sub-chore records (trimmed, non-empty, capped). */
function toSubChores(titles: string[], existing: SubChore[] = []): SubChore[] {
  return titles
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, MAX_SUB_CHORES)
    .map((title, i) => ({
      // Preserve ids positionally where we can, so a rename doesn't churn keys.
      id: existing[i]?.id ?? newId(),
      title,
    }));
}

/**
 * A ChoreRepository backed by the browser's localStorage.
 *
 * All reads/writes go through a single JSON blob under one key. The async
 * signatures are honoured (methods return resolved Promises) so this is a
 * drop-in match for a future network/SQL repository.
 */
export class LocalStorageChoreRepository implements ChoreRepository {
  private read(): Chore[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Chore[]) : [];
    } catch {
      return [];
    }
  }

  private write(chores: Chore[]): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chores));
    } catch {
      // Storage may be full or blocked (private mode). Fail quietly; the
      // in-memory UI state still reflects the attempted change this session.
    }
  }

  async getAll(): Promise<Chore[]> {
    return this.read();
  }

  async getById(id: string): Promise<Chore | null> {
    return this.read().find((c) => c.id === id) ?? null;
  }

  async create(input: ChoreInput): Promise<Chore> {
    const chores = this.read();
    const timestamp = nowISO();
    const chore: Chore = {
      id: newId(),
      title: input.title.trim(),
      frequencyValue: input.frequencyValue,
      frequencyUnit: input.frequencyUnit,
      subChores: toSubChores(input.subChores),
      lastCompletedDate: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    chores.push(chore);
    this.write(chores);
    return chore;
  }

  async update(id: string, input: ChoreInput): Promise<Chore> {
    const chores = this.read();
    const index = chores.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Chore not found: ${id}`);

    const existing = chores[index];
    const updated: Chore = {
      ...existing,
      title: input.title.trim(),
      frequencyValue: input.frequencyValue,
      frequencyUnit: input.frequencyUnit,
      subChores: toSubChores(input.subChores, existing.subChores),
      updatedAt: nowISO(),
    };
    chores[index] = updated;
    this.write(chores);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const chores = this.read().filter((c) => c.id !== id);
    this.write(chores);
  }

  async markDone(id: string, date: string = todayISO()): Promise<Chore> {
    const chores = this.read();
    const index = chores.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Chore not found: ${id}`);

    const updated: Chore = {
      ...chores[index],
      lastCompletedDate: date,
      updatedAt: nowISO(),
    };
    chores[index] = updated;
    this.write(chores);
    return updated;
  }
}
