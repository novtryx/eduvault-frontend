'use client';
import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Vault, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authApi } from '@/features/auth/api';
import {
  acceptInviteSchema,
  type AcceptInviteFormValues,
} from '@/features/auth/schemas';
import { ApiError } from '@/lib/api-client';

// Reached from the link in a staff invite email — POST /staff-invites/accept
// is @Public() and takes only { token, password }. It has no way to look up
// the invite first (no GET endpoint for it), so this page can't show who
// invited them or which school it's for ahead of time; the token/password
// submission itself is the only round-trip, and its error messages
// (invalid, expired, already used) come straight from the backend.
//
// Accepting an invite does NOT log the user in (no cookies are set by this
// endpoint) — it only creates/links the account. So on success we send
// them to Login rather than into the app.

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { toast } = useToast();
  const [accepted, setAccepted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
  });

  async function onSubmit(values: AcceptInviteFormValues) {
    if (!token) return;

    try {
      await authApi.acceptInvite({
        token,
        password: values.password,
      });

      setAccepted(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't accept invitation",
        description:
          error instanceof ApiError
            ? error.message
            : 'Please try again.',
      });
    }
  }

  if (!token) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger">
          <XCircle className="h-5 w-5" />
        </div>

        <h1 className="text-[18px] font-semibold text-navy-900">
          Invalid invite link
        </h1>

        <p className="mt-1.5 text-[13.5px] text-navy-400">
          This link is missing its invitation token. Please use the exact link
          from your invite email, or ask the school to send a new one.
        </p>

        <Button
          className="mt-6 w-full"
          variant="secondary"
          onClick={() => router.push('/login')}
        >
          Go to sign in
        </Button>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-success-bg text-success">
          <CheckCircle2 className="h-5 w-5" />
        </div>

        <h1 className="text-[18px] font-semibold text-navy-900">
          You're all set
        </h1>

        <p className="mt-1.5 text-[13.5px] text-navy-400">
          Your account is ready. Sign in with your email and the password you
          just created.
        </p>

        <Button
          className="mt-6 w-full"
          onClick={() => router.push('/login')}
        >
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white">
          <Vault className="h-5 w-5" />
        </div>

        <h1 className="text-[20px] font-semibold text-navy-900">
          Accept your invitation
        </h1>

        <p className="mt-1 text-[13.5px] text-navy-400">
          Set a password to activate your staff account
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-card"
      >
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>

          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            {...register('password')}
          />

          {errors.password ? (
            <p className="text-[12.5px] text-danger">
              {errors.password.message}
            </p>
          ) : (
            <p className="text-[12px] text-navy-400">
              At least 8 characters, with one letter and one number.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>

          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            {...register('confirmPassword')}
          />

          {errors.confirmPassword && (
            <p className="text-[12.5px] text-danger">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
        >
          Activate account
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-navy-400">
        Already activated?{' '}
        <Link
          href="/login"
          className="font-medium text-navy-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function AcceptInviteFallback() {
  return (
    <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white">
        <Vault className="h-5 w-5" />
      </div>

      <h1 className="text-[18px] font-semibold text-navy-900">
        Loading invitation...
      </h1>

      <p className="mt-1.5 text-[13.5px] text-navy-400">
        Please wait while we load your invitation.
      </p>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AcceptInviteFallback />}>
      <AcceptInviteContent />
    </Suspense>
  );
}

