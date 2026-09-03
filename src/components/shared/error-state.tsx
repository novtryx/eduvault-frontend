import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, title, onRetry, className }: ErrorStateProps) {
  const message =
    error instanceof ApiError
      ? error.message
      : 'Something went wrong while loading this. Please try again.';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-white px-6 py-14 text-center',
        className,
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-[14.5px] font-medium text-navy-800">{title ?? 'Unable to load this data'}</p>
        <p className="mx-auto max-w-sm text-[13px] text-navy-400">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
