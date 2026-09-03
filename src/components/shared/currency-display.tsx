import * as React from 'react';
import { formatKobo } from '@/lib/currency';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  kobo: number | null | undefined;
  showKobo?: boolean;
  className?: string;
  muted?: boolean;
  /** Larger size for headline figures (e.g. dashboard stat cards). */
  emphasis?: boolean;
}

/** Renders a kobo amount as naira with tabular numerals and strong weight,
 * so financial figures always visually stand out from surrounding text. */
export function CurrencyDisplay({ kobo, showKobo, className, muted, emphasis }: CurrencyDisplayProps) {
  return (
    <span
      className={cn(
        'tabular-nums font-semibold',
        muted ? 'text-navy-400' : 'text-navy-900',
        emphasis && 'text-[26px] tracking-tight',
        className,
      )}
    >
      {formatKobo(kobo, { showKobo })}
    </span>
  );
}