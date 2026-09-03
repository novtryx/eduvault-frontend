import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-white/60 px-6 py-16 text-center',
        className,
      )}
    >
      {icon && <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-50 text-navy-400">{icon}</div>}
      <div className="space-y-1">
        <p className="text-[14.5px] font-medium text-navy-800">{title}</p>
        {description && <p className="mx-auto max-w-sm text-[13px] text-navy-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
