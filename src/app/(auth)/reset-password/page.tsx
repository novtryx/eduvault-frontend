'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authApi } from '@/features/auth/api';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api-client';

// Reached from the link in a forgot-password email — see
// AuthService.forgotPassword's resetUrl: `${FRONTEND_URL}/reset-password?token=...`.
// POST /auth/reset-password is @Public() and takes {token, newPassword};
// its error message (invalid/expired/already-used token) is already
// written for a human reader — see AuthService.resetPassword's
// invalidTokenMessage. Resetting the password does NOT log the user in
// (no cookies are set), so on success we send them to Login, same
// pattern as the staff accept-invite flow.
//
// useSearchParams() requires a Suspense boundary in the App Router, so
// the actual page body lives in ResetPasswordForm below.
export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="h-11" />}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();
  const [reset, setReset] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) return;
    try {
      await authApi.resetPassword({ token, newPassword: values.newPassword });
      setReset(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't reset password",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger">
          <XCircle className="h-5 w-5" />
        </div>
        <h1 className="text-[20px] font-semibold text-navy-900">Invalid reset link</h1>
        <p className="mt-1.5 text-[14px] text-navy-400">
          This link is missing its reset token. Please use the exact link from your email, or request a new one.
        </p>
        <Button className="mt-7 w-full" size="lg" variant="secondary" asChild>
          <Link href="/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  if (reset) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-success-bg text-success">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h1 className="text-[20px] font-semibold text-navy-900">Password reset</h1>
        <p className="mt-1.5 text-[14px] text-navy-400">
          Your password has been changed. Sign in with your new password.
        </p>
        <Button className="mt-7 w-full" size="lg" onClick={() => router.push('/login')}>
          Go to sign in
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold tracking-tight text-navy-900">Set a new password</h1>
        <p className="mt-1.5 text-[14px] text-navy-400">Choose a new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput id="newPassword" placeholder="At least 8 characters" {...register('newPassword')} />
          {errors.newPassword ? (
            <p className="text-[12.5px] text-danger">{errors.newPassword.message}</p>
          ) : (
            <p className="text-[12px] text-navy-400">At least 8 characters, with one letter and one number.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Re-enter your new password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="text-[12.5px] text-danger">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </div>
  );
}