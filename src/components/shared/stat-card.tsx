import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sublabel?: React.ReactNode;
  trend?: { value: string; positive: boolean } | null;
  emphasis?: boolean;
  className?: string;
}

export function StatCard({ label, value, sublabel, trend, emphasis, className }: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-white p-5', className)}>
      <p className="text-[13px] font-medium text-navy-400">{label}</p>
      <p
        className={cn(
          'mt-2 tabular-nums tracking-tight text-navy-900',
          emphasis ? 'text-[28px] font-semibold' : 'text-[22px] font-semibold',
        )}
      >
        {value}
      </p>
      {(sublabel || trend) && (
        <div className="mt-1.5 flex items-center gap-2 text-[12.5px]">
          {trend && (
            <span className={cn('font-medium', trend.positive ? 'text-success' : 'text-danger')}>
              {trend.value}
            </span>
          )}
          {sublabel && <span className="text-navy-400">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
