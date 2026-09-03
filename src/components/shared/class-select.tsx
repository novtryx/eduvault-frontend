'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SchoolClass } from '@/types/entities';

interface ClassSelectProps {
  classes: SchoolClass[];
  value?: string;
  onChange: (classId: string) => void;
  placeholder?: string;
  className?: string;
  includeAll?: boolean;
}

export function ClassSelect({ classes, value, onChange, placeholder = 'Select class', className, includeAll }: ClassSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? 'w-[180px]'}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && <SelectItem value="all">All classes</SelectItem>}
        {classes.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}