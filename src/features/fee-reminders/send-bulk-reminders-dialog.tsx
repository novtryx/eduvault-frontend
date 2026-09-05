'use client';

import * as React from 'react';
import { Landmark, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useToast } from '@/components/ui/use-toast';
import { usePaymentSettings } from '@/features/payment-settings/hooks';
import { useSendBulkFeeReminders } from '@/features/fee-reminders/hooks';
import { ApiError } from '@/lib/api-client';
import type { BulkFeeActionResult } from '@/types/entities';

interface SendBulkFeeRemindersDialogProps {
  schoolId: string | null;
  academicSessionId: string;
  termId: string;
  termName: string;
  classId?: string;
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Reminds every parent who currently owes money for a term at once —
// distinct from the per-student "Send Payment Link" on a student's
// profile. Same bank-account prerequisite as that flow (checked
// upfront here too, so staff aren't left waiting on a bulk send that's
// guaranteed to fail on the first student). Synchronous on the
// backend — no progress events, so this shows an indeterminate
// "Sending…" state rather than a fake progress bar.
export function SendBulkFeeRemindersDialog({
  schoolId,
  academicSessionId,
  termId,
  termName,
  classId,
  className,
  open,
  onOpenChange,
}: SendBulkFeeRemindersDialogProps) {
  const { toast } = useToast();
  const settingsQuery = usePaymentSettings(schoolId);
  const sendMutation = useSendBulkFeeReminders(schoolId);
  const [result, setResult] = React.useState<BulkFeeActionResult | null>(null);

  React.useEffect(() => {
    if (open) setResult(null);
  }, [open]);

  async function handleSend() {
    try {
      const outcome = await sendMutation.mutateAsync({ academicSessionId, termId, classId });
      setResult(outcome);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't send reminders",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  const notReady = settingsQuery.data && !settingsQuery.data.isReadyToReceiveOnlinePayments;
  const scopeLabel = className ? `${className} · ${termName}` : termName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Fee Reminders</DialogTitle>
          {!result && !notReady && (
            <DialogDescription>
              Emails every parent with an outstanding balance for {scopeLabel} a reminder with a link to pay
              online — no login required for them.
            </DialogDescription>
          )}
        </DialogHeader>

        {result ? (
          <ResultView result={result} />
        ) : notReady ? (
          <EmptyState
            icon={<Landmark className="h-5 w-5" />}
            title="Bank account not connected"
            description="Connect a bank account under Settings → Payment Settings before sending fee reminders."
          />
        ) : null}

        <DialogFooter>
          {result ? (
            <Button type="button" className="ml-auto" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                {notReady ? 'Close' : 'Cancel'}
              </Button>
              {!notReady && (
                <Button type="button" onClick={handleSend} loading={sendMutation.isPending}>
                  <Send className="h-3.5 w-3.5" />
                  {sendMutation.isPending ? 'Sending…' : 'Send Reminders'}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResultView({ result }: { result: BulkFeeActionResult }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface-muted px-4 py-3">
        <div>
          <p className="text-[20px] font-semibold text-navy-900">{result.sent}</p>
          <p className="text-[12px] text-navy-400">of {result.totalStudentsChecked} students reminded</p>
        </div>
        {result.skipped.length > 0 && (
          <Badge variant="warning" className="ml-auto">
            {result.skipped.length} skipped
          </Badge>
        )}
      </div>

      {result.skipped.length > 0 && (
        <div className="max-h-[240px] overflow-y-auto rounded-md border border-border">
          <table className="w-full text-[12.5px]">
            <thead className="sticky top-0 bg-surface-muted text-navy-400">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Student</th>
                <th className="px-3 py-2 text-left font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {result.skipped.map((skip) => (
                <tr key={skip.studentId} className="border-t border-border">
                  <td className="px-3 py-2 text-navy-700">{skip.fullName}</td>
                  <td className="px-3 py-2 text-navy-500">{skip.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}