'use client';

import * as React from 'react';
import { AlertCircle, CheckCircle2, Vault } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicFeeInvoice, useInitializeFeePayment } from '@/features/public-fee-payment/hooks';
import { ApiError } from '@/lib/api-client';
import { formatKobo } from '@/lib/currency';

// Fully public — reached only via the tokenized link a parent gets by
// email (see FeePaymentsService.sendPaymentLink). No login, no school
// context in the URL; everything needed to show and pay the invoice
// comes back from GET /public/fee-payments/:token keyed off the token
// alone. This intentionally sits outside the (app) and (auth) route
// groups — it isn't part of the staff-facing product at all.
export default function PayInvoicePage({ params }: { params: { token: string } }) {
  const invoiceQuery = usePublicFeeInvoice(params.token);
  const initializeMutation = useInitializeFeePayment(params.token);
  const [payError, setPayError] = React.useState<string | null>(null);

  async function handlePay() {
    setPayError(null);
    try {
      const result = await initializeMutation.mutateAsync();
      // Full-page redirect to Paystack checkout — matches the
      // subscription and student-fee-link initialize flows elsewhere.
      // Paystack redirects back to /pay/[token]/callback once done.
      window.location.href = result.authorizationUrl;
    } catch (error) {
      setPayError(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-[440px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white">
            <Vault className="h-5 w-5" />
          </div>
          <p className="text-[13px] font-medium text-navy-400">School Fee Payment</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-card sm:p-8">
          {invoiceQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : invoiceQuery.isError ? (
            <ErrorPanel message={invoiceQuery.error instanceof ApiError ? invoiceQuery.error.message : 'This payment link could not be loaded.'} />
          ) : invoiceQuery.data ? (
            <InvoiceView
              invoice={invoiceQuery.data}
              onPay={handlePay}
              isPaying={initializeMutation.isPending}
              payError={payError}
            />
          ) : null}
        </div>

        <p className="mt-6 text-center text-[12px] text-navy-400">Secured by Paystack</p>
      </div>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-navy-900">This link isn't available</p>
        <p className="mt-1.5 text-[13.5px] text-navy-400">{message}</p>
      </div>
    </div>
  );
}

function InvoiceView({
  invoice,
  onPay,
  isPaying,
  payError,
}: {
  invoice: import('@/types/entities').PublicFeeInvoice;
  onPay: () => void;
  isPaying: boolean;
  payError: string | null;
}) {
  const isPaid = invoice.status === 'PAID';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[13px] text-navy-400">{invoice.schoolName}</p>
        <h1 className="mt-1 text-[19px] font-semibold text-navy-900">{invoice.studentName}</h1>
        <p className="mt-0.5 text-[13.5px] text-navy-500">
          {invoice.className} · {invoice.termName}, {invoice.academicSessionName}
        </p>
      </div>

      {isPaid ? (
        <div className="flex items-center gap-3 rounded-md bg-success-bg px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          <p className="text-[13.5px] text-navy-700">This fee has already been paid in full. Thank you!</p>
        </div>
      ) : (
        <>
          {invoice.components.length > 0 && (
            <div className="space-y-2 border-y border-border py-4">
              {invoice.components.map((component) => (
                <div key={component.label} className="flex items-center justify-between text-[13.5px]">
                  <span className="text-navy-500">{component.label}</span>
                  <span className="text-navy-700">{formatKobo(component.amountKobo)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[13.5px]">
              <span className="text-navy-500">Term fee</span>
              <span className="text-navy-700">{formatKobo(invoice.expectedFeeKobo)}</span>
            </div>
            {invoice.totalPaidKobo > 0 && (
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-navy-500">Already paid</span>
                <span className="text-navy-700">−{formatKobo(invoice.totalPaidKobo)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[13.5px]">
              <span className="text-navy-500">Outstanding</span>
              <span className="text-navy-700">{formatKobo(invoice.outstandingKobo)}</span>
            </div>
            <div className="flex items-center justify-between text-[13.5px]">
              <span className="text-navy-500">Online payment fee</span>
              <span className="text-navy-700">{formatKobo(invoice.surchargeKobo)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-[13.5px] font-medium text-navy-900">Total to pay</span>
            <span className="text-[22px] font-semibold tracking-tight text-navy-900">
              {formatKobo(invoice.totalPayableKobo)}
            </span>
          </div>

          {payError && (
            <p className="rounded-md bg-danger-bg px-3 py-2 text-[13px] text-danger">{payError}</p>
          )}

          <Button className="w-full" size="lg" onClick={onPay} loading={isPaying}>
            Pay {formatKobo(invoice.totalPayableKobo)}
          </Button>
        </>
      )}
    </div>
  );
}