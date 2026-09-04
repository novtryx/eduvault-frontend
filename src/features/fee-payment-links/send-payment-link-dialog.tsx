'use client';

import * as React from 'react';
import { CheckCircle2, Landmark, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { useToast } from '@/components/ui/use-toast';
import { usePaymentSettings } from '@/features/payment-settings/hooks';
import { useSendPaymentLink } from '@/features/fee-payment-links/hooks';
import { useStudentBalance } from '@/features/students/hooks';
import { ApiError } from '@/lib/api-client';
import { formatDate } from '@/lib/format-date';
import type { Student } from '@/types/entities';

interface SendPaymentLinkDialogProps {
  schoolId: string | null;
  student: Student;
  academicSessionId: string;
  termId: string;
  termName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Every prerequisite this dialog checks (subaccount set up, parent
// email on file, outstanding balance > 0) is ALSO enforced server-side
// in FeePaymentsService.sendPaymentLink, with its own clear error
// message for each — this dialog just surfaces the same conditions
// upfront so a staff member isn't clicking "Send" only to hit an error
// for something checkable before they even open the form.
export function SendPaymentLinkDialog({
  schoolId,
  student,
  academicSessionId,
  termId,
  termName,
  open,
  onOpenChange,
}: SendPaymentLinkDialogProps) {
  const { toast } = useToast();
  const settingsQuery = usePaymentSettings(schoolId);
  const balanceQuery = useStudentBalance(schoolId, student.id, termId);
  const sendMutation = useSendPaymentLink(schoolId, student.id);
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSentTo(null);
      setExpiresAt(null);
    }
  }, [open]);

  async function handleSend() {
    try {
      const result = await sendMutation.mutateAsync({ academicSessionId, termId });
      setSentTo(result.sentTo);
      setExpiresAt(result.expiresAt);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't send payment link",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  const notReady = settingsQuery.data && !settingsQuery.data.isReadyToReceiveOnlinePayments;
  const noParentEmail = !student.parentEmail;
  const noOutstandingBalance =
    balanceQuery.data && (balanceQuery.data.outstandingKobo === null || balanceQuery.data.outstandingKobo <= 0);

  const blockedReason = notReady
    ? {
        icon: <Landmark className="h-5 w-5" />,
        title: 'Bank account not connected',
        description: 'Connect a bank account under Settings → Payment Settings before sending parent payment links.',
      }
    : noParentEmail
      ? {
          icon: <Mail className="h-5 w-5" />,
          title: 'No parent email on file',
          description: `Add a parent email address for ${student.fullName} before sending a payment link.`,
        }
      : noOutstandingBalance
        ? {
            icon: <CheckCircle2 className="h-5 w-5" />,
            title: 'Nothing owed for this term',
            description: `${student.fullName} has no outstanding balance for ${termName}.`,
          }
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Send Payment Link</DialogTitle>
          {!sentTo && !blockedReason && (
            <DialogDescription>
              Emails {student.parentEmail} a breakdown of the {termName} fee for {student.fullName}, with a link to
              pay online — no login required.
            </DialogDescription>
          )}
        </DialogHeader>

        {sentTo ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success-bg text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-navy-900">Payment link sent</p>
              <p className="mt-1 text-[13px] text-navy-400">
                Emailed to {sentTo}. It expires on {formatDate(expiresAt)}.
              </p>
            </div>
          </div>
        ) : blockedReason ? (
          <EmptyState icon={blockedReason.icon} title={blockedReason.title} description={blockedReason.description} />
        ) : (
          balanceQuery.data &&
          balanceQuery.data.outstandingKobo !== null && (
            <div className="flex items-center justify-between rounded-md bg-surface-muted px-4 py-3">
              <span className="text-[12.5px] text-navy-400">Outstanding balance</span>
              <CurrencyDisplay kobo={balanceQuery.data.outstandingKobo} emphasis />
            </div>
          )
        )}

        <DialogFooter>
          {sentTo ? (
            <Button type="button" className="ml-auto" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                {blockedReason ? 'Close' : 'Cancel'}
              </Button>
              {!blockedReason && (
                <Button type="button" onClick={handleSend} loading={sendMutation.isPending}>
                  Send Link
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}