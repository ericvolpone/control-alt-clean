'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Chore } from '@/lib/types';
import {
  choreStatus,
  frequencyLabel,
  remainingDisplay,
  targetDate,
} from '@/lib/chore-logic';
import { formatFriendlyDate } from '@/lib/date';

interface ChoreTileProps {
  chore: Chore;
  onDone: (id: string) => void | Promise<unknown>;
}

export default function ChoreTile({ chore, onDone }: ChoreTileProps) {
  const [busy, setBusy] = useState(false);
  const status = choreStatus(chore);
  const remaining = remainingDisplay(chore);
  const target = targetDate(chore);

  const handleDone = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onDone(chore.id);
    } finally {
      setBusy(false);
    }
  };

  const signedNum =
    remaining.value > 0 ? `+${remaining.value}` : `${remaining.value}`;

  return (
    <motion.li
      layout
      layoutId={chore.id}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      className={`tile ${status}`}
    >
      <div className="tile-top">
        <div style={{ minWidth: 0 }}>
          <h3 className="tile-title">{chore.title}</h3>
          <p className="tile-freq">{frequencyLabel(chore)}</p>
        </div>
        <div
          className={`remaining ${status}`}
          role="status"
          aria-label={remaining.label}
          title={remaining.label}
        >
          <span className="num">{signedNum}</span>
          <span className="unit">{remaining.unit}</span>
        </div>
      </div>

      <div className="tile-meta">
        <span>🎯 Due</span>
        <strong>{formatFriendlyDate(target)}</strong>
      </div>

      {chore.subChores.length > 0 && (
        <ul className="subchores">
          {chore.subChores.map((sub) => (
            <li key={sub.id} className="subchip">
              {sub.title}
            </li>
          ))}
        </ul>
      )}

      <motion.button
        type="button"
        className="btn btn-primary"
        onClick={handleDone}
        disabled={busy}
        whileTap={{ scale: 0.95 }}
      >
        ✨ Chore Done
      </motion.button>
    </motion.li>
  );
}
