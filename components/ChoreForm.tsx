'use client';

import { useState } from 'react';
import type { Chore, ChoreInput, FrequencyUnit } from '@/lib/types';
import { MAX_SUB_CHORES } from '@/lib/types';

interface ChoreFormProps {
  /** When provided, the form edits this chore; otherwise it creates a new one. */
  chore?: Chore;
  onSave: (input: ChoreInput) => Promise<unknown> | void;
  onDelete?: () => Promise<unknown> | void;
}

export default function ChoreForm({ chore, onSave, onDelete }: ChoreFormProps) {
  const isEdit = Boolean(chore);

  const [title, setTitle] = useState(chore?.title ?? '');
  const [frequencyValue, setFrequencyValue] = useState(
    chore ? String(chore.frequencyValue) : '1',
  );
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>(
    chore?.frequencyUnit ?? 'weeks',
  );
  const [subChores, setSubChores] = useState<string[]>(
    chore?.subChores.map((s) => s.title) ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const freqNumber = Number(frequencyValue);
  const valid = title.trim().length > 0 && Number.isFinite(freqNumber) && freqNumber >= 1;

  const updateSub = (index: number, value: string) => {
    setSubChores((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const addSub = () => {
    setSubChores((prev) =>
      prev.length < MAX_SUB_CHORES ? [...prev, ''] : prev,
    );
  };

  const removeSub = (index: number) => {
    setSubChores((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        frequencyValue: Math.max(1, Math.round(freqNumber)),
        frequencyUnit,
        subChores,
      });
      if (isEdit) {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1800);
      } else {
        // Reset the "add new" form for the next entry.
        setTitle('');
        setFrequencyValue('1');
        setFrequencyUnit('weeks');
        setSubChores([]);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const ok = window.confirm(`Delete "${chore?.title}"? This can't be undone.`);
    if (!ok) return;
    await onDelete();
  };

  return (
    <div className="card">
      <h2>{isEdit ? chore?.title || 'Edit chore' : '➕ Add a new chore'}</h2>

      <div className="field">
        <label htmlFor={`title-${chore?.id ?? 'new'}`}>Title</label>
        <input
          id={`title-${chore?.id ?? 'new'}`}
          type="text"
          value={title}
          placeholder="e.g. Mop the kitchen"
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
      </div>

      <div className="freq-row">
        <div className="field">
          <label htmlFor={`freq-${chore?.id ?? 'new'}`}>Every</label>
          <input
            id={`freq-${chore?.id ?? 'new'}`}
            type="number"
            min={1}
            inputMode="numeric"
            value={frequencyValue}
            onChange={(e) => setFrequencyValue(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor={`unit-${chore?.id ?? 'new'}`}>Unit</label>
          <select
            id={`unit-${chore?.id ?? 'new'}`}
            value={frequencyUnit}
            onChange={(e) => setFrequencyUnit(e.target.value as FrequencyUnit)}
          >
            <option value="days">days</option>
            <option value="weeks">weeks</option>
          </select>
        </div>
      </div>

      <p className="section-title" style={{ marginTop: 18 }}>
        Sub-chores ({subChores.length}/{MAX_SUB_CHORES})
      </p>
      <p className="hint">
        Optional reminders of what this chore includes. They share the parent
        frequency.
      </p>

      {subChores.map((sub, i) => (
        <div className="subrow" key={i}>
          <input
            type="text"
            value={sub}
            placeholder={`Sub-chore ${i + 1}`}
            onChange={(e) => updateSub(i, e.target.value)}
            maxLength={60}
          />
          <button
            type="button"
            className="icon-btn"
            aria-label={`Remove sub-chore ${i + 1}`}
            onClick={() => removeSub(i)}
          >
            −
          </button>
        </div>
      ))}

      {subChores.length < MAX_SUB_CHORES && (
        <button type="button" className="btn btn-ghost" onClick={addSub}>
          + Add sub-chore
        </button>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!valid || saving}
        >
          {isEdit ? '💾 Save' : '💾 Save chore'}
        </button>
        {onDelete && (
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            🗑 Delete
          </button>
        )}
      </div>

      {savedFlash && <p className="saved-flash">✓ Saved!</p>}
    </div>
  );
}
