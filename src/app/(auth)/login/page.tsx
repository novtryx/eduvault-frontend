'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Vault } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authApi } from '@/features/auth/api';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas';
import { ApiError } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    try {
      await authApi.login(values);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      router.replace('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Couldn\u2019t sign in',
        description: error instanceof ApiError ? error.message : 'Please check your details and try again.',
      });
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white">
          <Vault className="h-5 w-5" />
        </div>
        <h1 className="text-[20px] font-semibold text-navy-900">Welcome back</h1>
        <p className="mt-1 text-[13.5px] text-navy-400">Sign in to your EduVault account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-card">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@school.edu.ng" {...register('email')} />
          {errors.email && <p className="text-[12.5px] text-danger">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" placeholder="At least 8 characters" {...register('password')} />
          {errors.password && <p className="text-[12.5px] text-danger">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-navy-400">
        Don&apos;t have a school account?{' '}
        <Link href="/register" className="font-medium text-navy-900 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
