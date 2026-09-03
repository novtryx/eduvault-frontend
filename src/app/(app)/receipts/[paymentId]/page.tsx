'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/auth-context';
import { usePayment, usePayments, useReceiptForPayment } from '@/features/payments/hooks';
import { useSchool } from '@/features/schools/hooks';
import { formatDate, formatDateTime } from '@/lib/format-date';
import { formatKobo } from '@/lib/currency';

export default function ReceiptPage() {
  const params = useParams<{ paymentId: string }>();
  const router = useRouter();
  const { currentSchoolId } = useAuth();

  const paymentQuery = usePayment(currentSchoolId, params.paymentId);
  const receiptQuery = useReceiptForPayment(currentSchoolId, params.paymentId);
  const schoolQuery = useSchool(currentSchoolId);

  const payment = paymentQuery.data;

  // The backend doesn't expose a "balance as of this payment" endpoint —
  // only a live current balance. To show an accurate Previous/Remaining
  // balance on a receipt for a payment that may not be the most recent
  // one, we pull every ACTIVE payment for this student+term and derive
  // the running total up to and including this payment ourselves. This
  // is display-only arithmetic over numbers the backend already
  // returned — not a re-derivation of any business rule.
  const termPaymentsQuery = usePayments(currentSchoolId, {
    studentId: payment?.studentId,
    termId: payment?.termId,
    status: 'ACTIVE',
    limit: 200,
  });

  const isLoading = paymentQuery.isLoading || receiptQuery.isLoading || schoolQuery.isLoading;
  const isError = paymentQuery.isError || receiptQuery.isError;

  const balances = React.useMemo(() => {
    if (!payment || !termPaymentsQuery.data) return null;
    const sorted = [...termPaymentsQuery.data.items].sort((a, b) => {
      const byDate = new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
      if (byDate !== 0) return byDate;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    let runningTotal = 0;
    let totalAfterThisPayment = 0;
    for (const p of sorted) {
      runningTotal += p.amountKobo;
      if (p.id === payment.id) {
        totalAfterThisPayment = runningTotal;
        break;
      }
    }

    const expected = payment.expectedFeeKoboSnapshot;
    const previousTotal = totalAfterThisPayment - payment.amountKobo;

    return {
      previousBalanceKobo: expected !== null ? Math.max(expected - previousTotal, 0) : null,
      remainingBalanceKobo: expected !== null ? Math.max(expected - totalAfterThisPayment, 0) : null,
    };
  }, [payment, termPaymentsQuery.data]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 pb-10 pt-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <ErrorState
        error={paymentQuery.error ?? receiptQuery.error}
        title="Couldn't load this receipt"
        onRetry={() => {
          paymentQuery.refetch();
          receiptQuery.refetch();
        }}
      />
    );
  }

  const receipt = receiptQuery.data;
  const school = schoolQuery.data;

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-10">
      <div className="no-print flex items-center justify-between">
        <Button variant="ghost" size="sm" className="-ml-2 text-navy-400" onClick={() => router.back()}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </div>

      <Card className="print-area">
        <CardContent className="p-8 sm:p-10">
          {/* School header */}
          <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              {school?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={school.logoUrl} alt={school.name} className="h-12 w-12 rounded-md object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-navy-900 text-[16px] font-semibold text-white">
                  {school?.name?.charAt(0) ?? 'E'}
                </div>
              )}
              <div>
                <p className="text-[16px] font-semibold text-navy-900">{school?.name ?? 'School'}</p>
                <p className="text-[12px] text-navy-400">{school?.address}</p>
                <p className="text-[12px] text-navy-400">
                  {[school?.phone, school?.email].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium uppercase tracking-wide text-navy-400">Receipt</p>
              <p className="text-[15px] font-semibold text-navy-900">{receipt?.receiptNumber ?? '—'}</p>
              <p className="text-[12px] text-navy-400">{formatDate(payment.paymentDate)}</p>
            </div>
          </div>

          {/* Student info */}
          <div className="grid grid-cols-2 gap-4 py-6 text-[13px]">
            <div>
              <p className="text-navy-400">Student</p>
              <p className="font-medium text-navy-900">{payment.student?.fullName}</p>
            </div>
            <div>
              <p className="text-navy-400">Admission No.</p>
              <p className="font-medium text-navy-900">{payment.student?.admissionNumber}</p>
            </div>
            <div>
              <p className="text-navy-400">Class</p>
              <p className="font-medium text-navy-900">{payment.student?.class?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-navy-400">Term</p>
              <p className="font-medium text-navy-900">
                {payment.academicSession?.name} · {payment.term?.name}
              </p>
            </div>
          </div>

          <Separator />

          {/* Amount breakdown */}
          <div className="space-y-3 py-6 text-[13.5px]">
            <div className="flex items-center justify-between">
              <span className="text-navy-500">Previous Balance</span>
              <span className="font-medium text-navy-900">{formatKobo(balances?.previousBalanceKobo)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-navy-500">Amount Paid</span>
              <span className="font-medium text-navy-900">{formatKobo(payment.amountKobo)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-navy-500">Payment Method</span>
              <span className="font-medium text-navy-900">
                {payment.method === 'BANK_TRANSFER' ? 'Bank Transfer' : payment.method === 'POS' ? 'POS' : 'Cash'}
              </span>
            </div>
            {payment.reference && (
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Reference</span>
                <span className="font-medium text-navy-900">{payment.reference}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[14.5px] font-medium text-navy-900">Remaining Balance</span>
              <span className="text-[18px] font-semibold text-navy-900">
                {formatKobo(balances?.remainingBalanceKobo)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="space-y-1 pt-6 text-center">
            <p className="text-[12.5px] text-navy-400">
              {school?.receiptFooter ?? 'Thank you for your payment.'}
            </p>
            {school?.receiptSignature && (
              <p className="pt-4 text-[12.5px] text-navy-500">{school.receiptSignature}</p>
            )}
            <p className="pt-2 text-[11px] text-navy-300">
              Generated {receipt ? formatDateTime(receipt.generatedAt) : formatDateTime(payment.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}