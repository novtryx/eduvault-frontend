'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authApi } from '@/features/auth/api';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api-client';

// POST /auth/forgot-password always returns the same generic message
// whether or not the email is registered — see AuthController's own
// comment on why (anti-enumeration: a different response for "found"
// vs "not found" would let someone probe which emails have accounts).
// This page must not — and structurally cannot, since the response
// carries no such signal — show a different state for either case. The
// success view always says "if an account exists", never "email sent"
// or "no account found".
export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await authApi.forgotPassword(values);
      setSubmitted(true);
    } catch (error) {
      // A genuine failure here (network error, rate limit) is distinct
      // from "email not found" — that case never throws, it's a normal
      // 200. So a toast here is safe and doesn't leak enumeration info.
      toast({
        variant: 'destructive',
        title: "Couldn't send reset link",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-success-bg text-success">
          <Mail className="h-5 w-5" />
        </div>
        <h1 className="text-[20px] font-semibold text-navy-900">Check your email</h1>
        <p className="mt-1.5 text-[14px] text-navy-400">
          If an account exists for that email, we&apos;ve sent a link to reset your password. It expires in 30
          minutes.
        </p>
        <Button className="mt-7 w-full" size="lg" variant="secondary" asChild>
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold tracking-tight text-navy-900">Reset your password</h1>
        <p className="mt-1.5 text-[14px] text-navy-400">
          Enter the email on your account and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@school.edu.ng" {...register('email')} />
          {errors.email && <p className="text-[12.5px] text-danger">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-7 flex items-center justify-center gap-1.5 text-[13.5px] font-medium text-navy-500 hover:text-navy-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
    </div>
  );
}