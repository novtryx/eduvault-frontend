'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vault, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authApi } from '@/features/auth/api';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [registered, setRegistered] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await authApi.register(values);
      setRegistered(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Couldn\u2019t create your account',
        description: error instanceof ApiError ? error.message : 'Please check your details and try again.',
      });
    }
  }

  if (registered) {
    return (
      <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-success-bg text-success">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h1 className="text-[18px] font-semibold text-navy-900">Account created</h1>
        <p className="mt-1.5 text-[13.5px] text-navy-400">
          Your school has been set up. Sign in to start managing fees and payments.
        </p>
        <Button className="mt-6 w-full" onClick={() => router.push('/login')}>
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
        <h1 className="text-[20px] font-semibold text-navy-900">Set up your school</h1>
        <p className="mt-1 text-[13.5px] text-navy-400">Create your EduVault account in a minute</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-card">
        <div className="space-y-1.5">
          <Label htmlFor="schoolName">School name</Label>
          <Input id="schoolName" placeholder="Bright Future Academy" {...register('schoolName')} />
          {errors.schoolName && <p className="text-[12.5px] text-danger">{errors.schoolName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Your full name</Label>
          <Input id="fullName" placeholder="Adaeze Okafor" {...register('fullName')} />
          {errors.fullName && <p className="text-[12.5px] text-danger">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@school.edu.ng" {...register('email')} />
          {errors.email && <p className="text-[12.5px] text-danger">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" {...register('password')} />
          {errors.password ? (
            <p className="text-[12.5px] text-danger">{errors.password.message}</p>
          ) : (
            <p className="text-[12px] text-navy-400">At least 8 characters, with one letter and one number.</p>
          )}
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-navy-400">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-navy-900 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}