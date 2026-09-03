'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Vault, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-context';
import { useVerifyBillingCallback } from '@/features/subscriptions/hooks';
import { ApiError } from '@/lib/api-client';

// Reached via a full-page redirect FROM Paystack, not app navigation —
// see SubscriptionsService.initializeSubscription's callback_url, which
// points here with ?reference=<paystack_reference>. GET /billing/callback
// is @Public() (BillingCallbackController) and does the actual
// verify-and-activate server-side; this page just calls it once and
// shows the result. It intentionally sits outside both (app) and (auth)
// route groups — it isn't part of the authenticated shell, but the
// person IS already logged in (this is a mid-session redirect, not a
// fresh visit), so it reads their current school from auth context
// rather than asking them to log in again.
export default function BillingCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const { currentSchoolId, isLoading: authLoading } = useAuth();

  const callbackQuery = useVerifyBillingCallback(reference, currentSchoolId);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white">
            <Vault className="h-5 w-5" />
          </div>
          <h1 className="text-[20px] font-semibold text-navy-900">Confirming your payment</h1>
        </div>

        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          {!reference ? (
            <>
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger">
                <XCircle className="h-5 w-5" />
              </div>
              <h2 className="text-[16px] font-semibold text-navy-900">Missing payment reference</h2>
              <p className="mt-1.5 text-[13.5px] text-navy-400">
                This link is missing its payment reference. If you completed a checkout, please check your
                subscription status directly.
              </p>
            </>
          ) : authLoading || callbackQuery.isLoading ? (
            <>
              <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-navy-400" />
              <p className="text-[13.5px] text-navy-400">Verifying your payment with Paystack…</p>
            </>
          ) : callbackQuery.isError ? (
            <>
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger">
                <XCircle className="h-5 w-5" />
              </div>
              <h2 className="text-[16px] font-semibold text-navy-900">Couldn't confirm payment</h2>
              <p className="mt-1.5 text-[13.5px] text-navy-400">
                {callbackQuery.error instanceof ApiError
                  ? callbackQuery.error.message
                  : "We couldn't verify this payment. If you were charged, it may take a few minutes to reflect — check your subscription status shortly."}
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-success-bg text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-[16px] font-semibold text-navy-900">Payment confirmed</h2>
              <p className="mt-1.5 text-[13.5px] text-navy-400">
                Your subscription is now active. Thank you!
              </p>
            </>
          )}

          <Button
            className="mt-6 w-full"
            variant={callbackQuery.isSuccess ? 'default' : 'secondary'}
            onClick={() => router.push('/settings')}
          >
            Go to Settings
          </Button>
        </div>

        <p className="mt-6 text-center text-[13px] text-navy-400">
          Not the right account?{' '}
          <Link href="/login" className="font-medium text-navy-900 hover:underline">
            Sign in again
          </Link>
        </p>
      </div>
    </div>
  );
}