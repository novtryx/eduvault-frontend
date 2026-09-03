'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AcademicSession } from '@/types/entities';

interface TermSelectProps {
  sessions: AcademicSession[];
  value?: string;
  onChange: (termId: string) => void;
  className?: string;
}

export function TermSelect({ sessions, value, onChange, className }: TermSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? 'w-[220px]'}>
        <SelectValue placeholder="Select term" />
      </SelectTrigger>
      <SelectContent>
        {sessions.map((session) => (
          <SelectGroup key={session.id}>
            <SelectLabel>{session.name}</SelectLabel>
            {(session.terms ?? []).map((term) => (
              <SelectItem key={term.id} value={term.id}>
                {term.name}
                {term.isCurrent ? ' (current)' : ''}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
