'use client';

import * as React from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-context';
import { AuthBrandPanel } from '@/components/marketing/auth-brand-panel';

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
    <div className="flex min-h-screen bg-background">
      {/* Hidden below lg — a two-column split only helps once there's
          room for both sides to breathe; on a phone the branded panel
          would just push the actual form below the fold. */}
      <AuthBrandPanel />
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
        <div className="w-full max-w-[400px]">
          {/* The brand panel is hidden below lg — this keeps the page
              from feeling completely unbranded on mobile without
              repeating the panel's full marketing content there. */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Image src="/logo.png" alt="" width={26} height={26} className="rounded-md" />
            <span className="text-[15px] font-semibold tracking-tight text-navy-900">Novtryx School</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}