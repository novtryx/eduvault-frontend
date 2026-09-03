'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { hasPermission } from '@/lib/permissions';
import { useAuth } from '@/features/auth/auth-context';
import type { NavItem } from './nav-config';

export function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { isOwner, permissionKeys } = useAuth();

  const visibleItems = items.filter(
    (item) => item.permission === null || hasPermission(item.permission, { isOwner, permissionKeys }),
  );

  return (
    <nav className="flex flex-col gap-0.5">
      {visibleItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors',
              active ? 'bg-navy-900 text-white' : 'text-navy-500 hover:bg-navy-50 hover:text-navy-900',
            )}
          >
            <Icon className={cn('h-[17px] w-[17px]', active ? 'text-white' : 'text-navy-400 group-hover:text-navy-600')} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
