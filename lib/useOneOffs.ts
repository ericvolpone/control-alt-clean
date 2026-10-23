'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OneOffChore } from '@/lib/types';
import { ONE_OFF_HISTORY_MONTHS } from '@/lib/types';
import { getOneOffRepository } from '@/lib/storage';
import { addMonths, todayISO } from '@/lib/date';

/** The oldest completedDate still kept in history. */
export function historyCutoff(today: string = todayISO()): string {
  return addMonths(today, -ONE_OFF_HISTORY_MONTHS);
}

/**
 * Loads one-off chores and exposes add / done / undo / delete actions. On load
 * it purges completed one-offs older than the history window, so expired items
 * are cleaned up the next time the app opens.
 */
export function useOneOffs() {
  const [items, setItems] = useState<OneOffChore[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await getOneOffRepository().getAll();
    setItems(all);
    return all;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const repo = getOneOffRepository();
      await repo.purgeCompletedBefore(historyCutoff());
      const all = await repo.getAll();
      if (active) {
        setItems(all);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  /** Open items oldest-first; completed items most-recently-done first. */
  const { open, completed } = useMemo(() => {
    const cutoff = historyCutoff();
    return {
      open: items
        .filter((i) => i.completedDate === null)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      completed: items
        .filter((i) => i.completedDate !== null && i.completedDate >= cutoff)
        .sort(
          (a, b) =>
            b.completedDate!.localeCompare(a.completedDate!) ||
            b.updatedAt.localeCompare(a.updatedAt),
        ),
    };
  }, [items]);

  const addOneOff = useCallback(
    async (title: string) => {
      await getOneOffRepository().create(title);
      return refresh();
    },
    [refresh],
  );

  const markDone = useCallback(
    async (id: string) => {
      await getOneOffRepository().setCompleted(id, todayISO());
      return refresh();
    },
    [refresh],
  );

  const reopen = useCallback(
    async (id: string) => {
      await getOneOffRepository().setCompleted(id, null);
      return refresh();
    },
    [refresh],
  );

  const removeOneOff = useCallback(
    async (id: string) => {
      await getOneOffRepository().remove(id);
      return refresh();
    },
    [refresh],
  );

  return {
    open,
    completed,
    loading,
    addOneOff,
    markDone,
    reopen,
    removeOneOff,
  };
}
