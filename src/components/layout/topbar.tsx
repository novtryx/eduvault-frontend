'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileNav } from './mobile-nav';
import { useAuth } from '@/features/auth/auth-context';
import { authApi } from '@/features/auth/api';
import { useToast } from '@/components/ui/use-toast';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function TopBar() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Even if the network call fails, clear local state and send the
      // user to login — staying "logged in" client-side while the
      // server session is gone would be worse.
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface-muted/90 px-4 backdrop-blur-sm sm:px-6">
      <MobileNav />
      <div className="flex-1" />
      <Button asChild size="sm" className="hidden sm:inline-flex">
        <Link href="/payments/record">
          <Plus className="h-4 w-4" />
          Record Payment
        </Link>
      </Button>
      <Button asChild size="icon" className="sm:hidden">
        <Link href="/payments/record">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Record Payment</span>
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900">
            <Avatar>
              <AvatarFallback>{user ? initials(user.fullName) : <UserIcon className="h-4 w-4" />}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="truncate font-medium text-navy-900">{user?.fullName}</p>
            <p className="truncate text-[12px] font-normal text-navy-400">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
