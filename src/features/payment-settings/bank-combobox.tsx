'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { PaystackBank } from '@/types/entities';

interface BankComboboxProps {
  banks: PaystackBank[];
  isLoading?: boolean;
  value: string;
  onChange: (bankCode: string) => void;
  disabled?: boolean;
}

// Client-side filtered — the bank list (~30-40 Nigerian banks) is small
// enough to load in full and filter locally, unlike StudentCombobox's
// server-side debounced search which exists for a list too large to
// ever load in full.
export function BankCombobox({ banks, isLoading, value, onChange, disabled }: BankComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = banks.find((b) => b.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className="w-full justify-between font-normal"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-navy-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading banks…
            </span>
          ) : selected ? (
            selected.name
          ) : (
            <span className="text-navy-400">Select your bank</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-navy-300" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search banks…" />
          <CommandList>
            <CommandEmpty>No bank found.</CommandEmpty>
            <CommandGroup>
              {banks.map((bank) => (
                <CommandItem
                  key={bank.code}
                  value={bank.name}
                  onSelect={() => {
                    onChange(bank.code);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', bank.code === value ? 'opacity-100' : 'opacity-0')} />
                  {bank.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}