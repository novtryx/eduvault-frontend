'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Vault, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVerifyFeePaymentCallback } from '@/features/public-fee-payment/hooks';
import { ApiError } from '@/lib/api-client';
import { formatKobo } from '@/lib/currency';

// Reached via a full-page redirect FROM Paystack — see
// FeePaymentsService.initializePayment's callbackUrl:
// `${frontendUrl}/pay/${token}/callback`. GET /public/fee-payments/callback
// is @Public() and does the actual verify-and-complete server-side
// (recording the Payment, generating a receipt); this page just calls
// it once with the `reference` query param and shows the result. Fully
// public, same as the invoice page itself — a parent reaches this with
// no account and needs none.
//
// useSearchParams() requires a Suspense boundary in the App Router, so
// the actual page body lives in PayCallbackContent below; this default
// export just supplies the boundary and a fallback that mirrors the
// "verifying" state so there's no visual flash on first paint.
export default function PayCallbackPage({ params }: { params: { token: string } }) {
  return (
    <React.Suspense fallback={<CallbackShell><VerifyingState /></CallbackShell>}>
      <PayCallbackContent token={params.token} />
    </React.Suspense>
  );
}

function PayCallbackContent({ token }: { token: string }) {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const callbackQuery = useVerifyFeePaymentCallback(reference);

  return (
    <CallbackShell>
      {!reference ? (
        <>
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger">
            <XCircle className="h-5 w-5" />
          </div>
          <h2 className="text-[16px] font-semibold text-navy-900">Missing payment reference</h2>
          <p className="mt-1.5 text-[13.5px] text-navy-400">
            This link is missing its payment reference. If you completed a payment, please check with the
            school directly.
          </p>
        </>
      ) : callbackQuery.isLoading ? (
        <VerifyingState />
      ) : callbackQuery.isError ? (
        <>
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger">
            <XCircle className="h-5 w-5" />
          </div>
          <h2 className="text-[16px] font-semibold text-navy-900">Couldn't confirm payment</h2>
          <p className="mt-1.5 text-[13.5px] text-navy-400">
            {callbackQuery.error instanceof ApiError
              ? callbackQuery.error.message
              : "We couldn't verify this payment. If you were charged, please contact the school directly."}
          </p>
        </>
      ) : (
        <>
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-success-bg text-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h2 className="text-[16px] font-semibold text-navy-900">Payment confirmed</h2>
          <p className="mt-1.5 text-[13.5px] text-navy-400">
            {callbackQuery.data
              ? `${formatKobo(callbackQuery.data.amountKobo)} received. Thank you!`
              : 'Thank you for your payment!'}
          </p>
        </>
      )}

      {reference && !callbackQuery.isLoading && (
        <Button className="mt-6 w-full" variant={callbackQuery.isSuccess ? 'default' : 'secondary'} asChild>
          <Link href={`/pay/${token}`}>Back to invoice</Link>
        </Button>
      )}
    </CallbackShell>
  );
}

function VerifyingState() {
  return (
    <>
      <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-navy-400" />
      <p className="text-[13.5px] text-navy-400">Verifying your payment with Paystack…</p>
    </>
  );
}

function CallbackShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white">
            <Vault className="h-5 w-5" />
          </div>
          <h1 className="text-[20px] font-semibold text-navy-900">Confirming your payment</h1>
        </div>

        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">{children}</div>
      </div>
    </div>
  );
}