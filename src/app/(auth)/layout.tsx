'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-context';

// Only /login and /register redirect an already-authenticated visitor
// straight to the dashboard — /staff/accept-invite shares this layout
// but must NOT redirect, since accepting an invite while already
// logged in (e.g. an existing staff member added to a second school)
// is a legitimate, common case.
const REDIRECT_IF_AUTHENTICATED_PATHS = ['/login', '/register'];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const shouldGuard = REDIRECT_IF_AUTHENTICATED_PATHS.includes(pathname);

  React.useEffect(() => {
    if (!shouldGuard || isLoading || !isAuthenticated) return;
    router.replace('/dashboard');
  }, [shouldGuard, isLoading, isAuthenticated, router]);

  if (shouldGuard && (isLoading || isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-navy-300" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}