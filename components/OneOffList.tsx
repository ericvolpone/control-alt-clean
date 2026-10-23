'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { OneOffChore } from '@/lib/types';
import { ONE_OFF_HISTORY_MONTHS } from '@/lib/types';
import { formatFriendlyDate } from '@/lib/date';
import { useOneOffs } from '@/lib/useOneOffs';

const itemMotion = {
  layout: true,
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.94 },
  transition: { type: 'spring', stiffness: 420, damping: 34 },
} as const;

interface RowProps {
  item: OneOffChore;
  onToggle: (id: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

function OneOffRow({ item, onToggle, onDelete }: RowProps) {
  const [busy, setBusy] = useState(false);
  const done = item.completedDate !== null;

  const run = async (action: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    const ok = window.confirm(`Delete "${item.title}"? This can't be undone.`);
    if (ok) run(() => onDelete(item.id));
  };

  return (
    <motion.li {...itemMotion} className={`oneoff ${done ? 'done' : ''}`}>
      <button
        type="button"
        className="oneoff-check"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Mark "${item.title}" not done` : `Mark "${item.title}" done`}
        onClick={() => run(() => onToggle(item.id))}
        disabled={busy}
      >
        {done ? '✓' : ''}
      </button>
      <div className="oneoff-body">
        <span className="oneoff-title">{item.title}</span>
        {done && (
          <span className="oneoff-date">
            Done {formatFriendlyDate(item.completedDate!)}
          </span>
        )}
      </div>
      <button
        type="button"
        className="icon-btn"
        aria-label={`Delete "${item.title}"`}
        onClick={handleDelete}
        disabled={busy}
      >
        ×
      </button>
    </motion.li>
  );
}

export default function OneOffList() {
  const { open, completed, loading, addOneOff, markDone, reopen, removeOneOff } =
    useOneOffs();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await addOneOff(title);
      setTitle('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack">
      <form className="card oneoff-add" onSubmit={handleAdd}>
        <input
          type="text"
          value={title}
          placeholder="e.g. Clean out the garage"
          aria-label="New one-off chore"
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!title.trim() || saving}
        >
          ➕ Add
        </button>
      </form>

      {loading ? (
        <p className="hint" style={{ textAlign: 'center' }}>
          Loading…
        </p>
      ) : (
        <>
          <section>
            <p className="section-title">To do ({open.length})</p>
            {open.length > 0 ? (
              <ul className="oneoffs">
                <AnimatePresence initial={false}>
                  {open.map((item) => (
                    <OneOffRow
                      key={item.id}
                      item={item}
                      onToggle={markDone}
                      onDelete={removeOneOff}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <p className="hint" style={{ textAlign: 'center' }}>
                Nothing on the list — enjoy the sparkle! 🫧
              </p>
            )}
          </section>

          {completed.length > 0 && (
            <section>
              <p className="section-title">
                Completed · last {ONE_OFF_HISTORY_MONTHS} months
              </p>
              <ul className="oneoffs">
                <AnimatePresence initial={false}>
                  {completed.map((item) => (
                    <OneOffRow
                      key={item.id}
                      item={item}
                      onToggle={reopen}
                      onDelete={removeOneOff}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
