import type { ChoreRepository } from './repository';
import { LocalStorageChoreRepository } from './localStorageRepository';

/**
 * Single source of truth for which storage backend the app uses.
 *
 * To migrate to a real database later, implement `ChoreRepository` against your
 * API/SQL layer (e.g. `SqlChoreRepository`) and swap the one line below. Because
 * every consumer depends only on the `ChoreRepository` interface, nothing else
 * needs to change.
 */
let instance: ChoreRepository | null = null;

export function getChoreRepository(): ChoreRepository {
  if (!instance) {
    instance = new LocalStorageChoreRepository();
  }
  return instance;
}

export type { ChoreRepository } from './repository';
