'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { useToast } from '@/components/ui/use-toast';
import { useReversePayment } from '@/features/payments/hooks';
import { ApiError } from '@/lib/api-client';
import type { Payment } from '@/types/entities';

// Matches ReversePaymentDto exactly: reason is required, 5-500 chars —
// "kept as an audit trail instead of a delete" per the backend's own
// comment, so this can't be a plain confirm-dialog with no input.
const reversePaymentSchema = z.object({
  reason: z
    .string()
    .min(5, 'Please give a reason (at least 5 characters)')
    .max(500, 'Keep it under 500 characters'),
});
type ReversePaymentFormValues = z.infer<typeof reversePaymentSchema>;

interface ReversePaymentDialogProps {
  schoolId: string | null;
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReversePaymentDialog({ schoolId, payment, open, onOpenChange }: ReversePaymentDialogProps) {
  const { toast } = useToast();
  const reverseMutation = useReversePayment(schoolId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReversePaymentFormValues>({ resolver: zodResolver(reversePaymentSchema) });

  React.useEffect(() => {
    if (open) reset({ reason: '' });
  }, [open, reset]);

  async function onSubmit(values: ReversePaymentFormValues) {
    if (!payment) return;
    try {
      await reverseMutation.mutateAsync({ paymentId: payment.id, payload: { reason: values.reason } });
      toast({ title: 'Payment reversed', description: "The student's balance has been updated." });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't reverse payment",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reverse this payment?</DialogTitle>
          <DialogDescription>
            {payment && (
              <>
                This marks the <CurrencyDisplay kobo={payment.amountKobo} /> payment from{' '}
                <span className="font-medium text-navy-700">{payment.student?.fullName ?? 'this student'}</span> as
                reversed and adds it back to their outstanding balance. This can't be undone from the app.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason for reversal</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Duplicate entry, wrong student, payment did not clear…"
              {...register('reason')}
            />
            {errors.reason && <p className="text-[12.5px] text-danger">{errors.reason.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" loading={isSubmitting}>
              Reverse Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}