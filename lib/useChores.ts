'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Chore, ChoreInput } from '@/lib/types';
import { getChoreRepository } from '@/lib/storage';
import { targetDate } from '@/lib/chore-logic';

export type SortKey = 'name' | 'target';

/** Alphabetical, case-insensitive sort by title (used on the edit screen). */
export function sortByName(chores: Chore[]): Chore[] {
  return [...chores].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
  );
}

/** Sort by next-due date ascending; ties broken alphabetically. */
export function sortByTarget(chores: Chore[]): Chore[] {
  return [...chores].sort((a, b) => {
    const diff = targetDate(a).localeCompare(targetDate(b));
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  });
}

export function sortChores(chores: Chore[], key: SortKey): Chore[] {
  return key === 'name' ? sortByName(chores) : sortByTarget(chores);
}

/**
 * Loads chores from the active repository and exposes CRUD + "done" actions.
 * Keeps a local copy in React state so the UI updates immediately; every action
 * persists through the repository and refreshes from it.
 */
export function useChores() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const repo = getChoreRepository();
    const all = await repo.getAll();
    setChores(all);
    return all;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const repo = getChoreRepository();
      const all = await repo.getAll();
      if (active) {
        setChores(all);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const createChore = useCallback(
    async (input: ChoreInput) => {
      await getChoreRepository().create(input);
      return refresh();
    },
    [refresh],
  );

  const updateChore = useCallback(
    async (id: string, input: ChoreInput) => {
      await getChoreRepository().update(id, input);
      return refresh();
    },
    [refresh],
  );

  const removeChore = useCallback(
    async (id: string) => {
      await getChoreRepository().remove(id);
      return refresh();
    },
    [refresh],
  );

  const markDone = useCallback(
    async (id: string) => {
      await getChoreRepository().markDone(id);
      return refresh();
    },
    [refresh],
  );

  return {
    chores,
    loading,
    refresh,
    createChore,
    updateChore,
    removeChore,
    markDone,
  };
}
