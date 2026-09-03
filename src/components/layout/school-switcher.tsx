'use client';

import { ChevronsUpDown, Check, Building2 } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function SchoolSwitcher() {
  const { schools, currentSchoolId, currentMembership, setCurrentSchoolId } = useAuth();

  if (schools.length <= 1) {
    return (
      <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy-900 text-white">
          <Building2 className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-navy-900">
            {currentMembership?.schoolName ?? 'EduVault'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-navy-50">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy-900 text-white">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-navy-900">
              {currentMembership?.schoolName ?? 'Select school'}
            </p>
            <p className="truncate text-[11.5px] text-navy-400">{currentMembership?.roleName}</p>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-navy-300" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Your schools</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {schools.map((school) => (
          <DropdownMenuItem
            key={school.schoolId}
            onClick={() => setCurrentSchoolId(school.schoolId)}
            className="justify-between"
          >
            <div className="min-w-0">
              <p className="truncate">{school.schoolName}</p>
              <p className="truncate text-[11.5px] text-navy-400">{school.roleName}</p>
            </div>
            {school.schoolId === currentSchoolId && <Check className={cn('h-4 w-4 text-navy-900')} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
