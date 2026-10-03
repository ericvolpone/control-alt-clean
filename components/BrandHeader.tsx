'use client';

import Link from 'next/link';
import { assetPath } from '@/lib/asset';

interface BrandHeaderProps {
  /** Right-hand action: either the edit link (home) or a back link (edit). */
  action: 'edit' | 'home';
}

export default function BrandHeader({ action }: BrandHeaderProps) {
  return (
    <header className="app-header">
      <Link href="/" className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetPath('/mop.svg')} alt="" aria-hidden="true" />
        <span className="brand-text">
          <h1>Control Alt Clean</h1>
          <span>sparkle, on schedule</span>
        </span>
      </Link>

      {action === 'edit' ? (
        <Link href="/edit" className="btn btn-secondary">
          ✏️ Edit
        </Link>
      ) : (
        <Link href="/" className="btn btn-secondary">
          ← Home
        </Link>
      )}
    </header>
  );
}
