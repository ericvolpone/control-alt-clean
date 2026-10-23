import type { ChoreRepository } from './repository';
import type { OneOffRepository } from './oneOffRepository';
import { LocalStorageChoreRepository } from './localStorageRepository';
import { LocalStorageOneOffRepository } from './localStorageOneOffRepository';

/**
 * Single source of truth for which storage backend the app uses.
 *
 * To migrate to a real database later, implement `ChoreRepository` and
 * `OneOffRepository` against your API/SQL layer and swap the lines below.
 * Because every consumer depends only on the interfaces, nothing else needs to
 * change.
 */
let instance: ChoreRepository | null = null;
let oneOffInstance: OneOffRepository | null = null;

export function getChoreRepository(): ChoreRepository {
  if (!instance) {
    instance = new LocalStorageChoreRepository();
  }
  return instance;
}

export function getOneOffRepository(): OneOffRepository {
  if (!oneOffInstance) {
    oneOffInstance = new LocalStorageOneOffRepository();
  }
  return oneOffInstance;
}

export type { ChoreRepository } from './repository';
export type { OneOffRepository } from './oneOffRepository';
