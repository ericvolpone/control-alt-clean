'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import BrandHeader from '@/components/BrandHeader';
import ChoreTile from '@/components/ChoreTile';
import OneOffList from '@/components/OneOffList';
import { assetPath } from '@/lib/asset';
import { sortChores, useChores, type SortKey } from '@/lib/useChores';

type Tab = 'scheduled' | 'oneoffs';

// Remembers the last-viewed tab so coming back from the edit screen (or
// reopening the app) lands where you left off. Purely a convenience.
const TAB_KEY = 'control-alt-clean.tab';

export default function HomePage() {
  const { chores, loading, markDone } = useChores();
  const [sortKey, setSortKey] = useState<SortKey>('target');
  const [tab, setTab] = useState<Tab>('scheduled');

  useEffect(() => {
    try {
      if (window.localStorage.getItem(TAB_KEY) === 'oneoffs') setTab('oneoffs');
    } catch {
      // Storage unavailable; default tab is fine.
    }
  }, []);

  const selectTab = (next: Tab) => {
    setTab(next);
    try {
      window.localStorage.setItem(TAB_KEY, next);
    } catch {
      // Ignore; the tab just won't be remembered.
    }
  };

  const ordered = useMemo(
    () => sortChores(chores, sortKey),
    [chores, sortKey],
  );

  return (
    <main className="page">
      <BrandHeader action="edit" />

      <div className="tabs" role="tablist" aria-label="Chore lists">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'scheduled'}
          className={tab === 'scheduled' ? 'active' : ''}
          onClick={() => selectTab('scheduled')}
        >
          🗓 Scheduled
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'oneoffs'}
          className={tab === 'oneoffs' ? 'active' : ''}
          onClick={() => selectTab('oneoffs')}
        >
          ✅ One-Offs
        </button>
      </div>

      {tab === 'oneoffs' ? (
        <OneOffList />
      ) : loading ? (
        <p className="hint" style={{ textAlign: 'center' }}>
          Loading your chores…
        </p>
      ) : chores.length === 0 ? (
        <div className="empty">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath('/mop.svg')} alt="" aria-hidden="true" />
          <h2>No chores yet!</h2>
          <p>Add your first chore to start tracking your sparkle schedule.</p>
          <Link href="/edit" className="btn btn-primary">
            ✏️ Add a chore
          </Link>
        </div>
      ) : (
        <>
          <div className="toolbar">
            <span className="toolbar-label">Sort by</span>
            <div className="segmented" role="group" aria-label="Sort chores">
              <button
                type="button"
                className={sortKey === 'name' ? 'active' : ''}
                onClick={() => setSortKey('name')}
                aria-pressed={sortKey === 'name'}
              >
                Name
              </button>
              <button
                type="button"
                className={sortKey === 'target' ? 'active' : ''}
                onClick={() => setSortKey('target')}
                aria-pressed={sortKey === 'target'}
              >
                Target Date
              </button>
            </div>
          </div>

          <ul className="tiles">
            <AnimatePresence>
              {ordered.map((chore) => (
                <ChoreTile key={chore.id} chore={chore} onDone={markDone} />
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}
    </main>
  );
}
