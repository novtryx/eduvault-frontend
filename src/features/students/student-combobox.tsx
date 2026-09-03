'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useStudents } from '@/features/students/hooks';
import { useAuth } from '@/features/auth/auth-context';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { cn } from '@/lib/utils';
import type { Student } from '@/types/entities';

interface StudentComboboxProps {
  value?: Student | null;
  onChange: (student: Student) => void;
  placeholder?: string;
}

export function StudentCombobox({ value, onChange, placeholder = 'Search by name or admission no.' }: StudentComboboxProps) {
  const { currentSchoolId } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const studentsQuery = useStudents(currentSchoolId, {
    page: 1,
    limit: 15,
    search: debouncedSearch || undefined,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? (
            <span className="truncate">
              {value.fullName} <span className="text-navy-400">· {value.admissionNumber}</span>
            </span>
          ) : (
            <span className="text-navy-300">{placeholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-navy-300" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Type a name or admission number..." value={search} onValueChange={setSearch} />
          <CommandList>
            {studentsQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-[13px] text-navy-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching...
              </div>
            ) : studentsQuery.data && studentsQuery.data.items.length > 0 ? (
              <CommandGroup>
                {studentsQuery.data.items.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={student.id}
                    onSelect={() => {
                      onChange(student);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', value?.id === student.id ? 'opacity-100' : 'opacity-0')} />
                    <div className="min-w-0">
                      <p className="truncate">{student.fullName}</p>
                      <p className="truncate text-[11.5px] text-navy-400">
                        {student.admissionNumber} · {student.class?.name ?? 'Unassigned'}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty>No students found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}