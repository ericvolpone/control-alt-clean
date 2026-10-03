'use client';

import { useMemo } from 'react';
import BrandHeader from '@/components/BrandHeader';
import ChoreForm from '@/components/ChoreForm';
import { sortByName, useChores } from '@/lib/useChores';

export default function EditPage() {
  const { chores, loading, createChore, updateChore, removeChore } = useChores();

  // Chores are always shown alphabetically on the edit screen.
  const ordered = useMemo(() => sortByName(chores), [chores]);

  return (
    <main className="page">
      <BrandHeader action="home" />

      <div className="stack">
        <ChoreForm onSave={createChore} />

        {loading ? (
          <p className="hint" style={{ textAlign: 'center' }}>
            Loading…
          </p>
        ) : ordered.length > 0 ? (
          <>
            <p className="section-title">Your chores (A–Z)</p>
            {ordered.map((chore) => (
              <ChoreForm
                key={chore.id}
                chore={chore}
                onSave={(input) => updateChore(chore.id, input)}
                onDelete={() => removeChore(chore.id)}
              />
            ))}
          </>
        ) : (
          <p className="hint" style={{ textAlign: 'center' }}>
            No chores yet — add your first one above! 🫧
          </p>
        )}
      </div>
    </main>
  );
}
