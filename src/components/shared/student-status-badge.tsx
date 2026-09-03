import { Badge } from '@/components/ui/badge';
import type { StudentStatus } from '@/types/entities';

const config: Record<StudentStatus, { label: string; variant: 'success' | 'warning' | 'default' | 'outline' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  GRADUATED: { label: 'Graduated', variant: 'default' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'warning' },
  ARCHIVED: { label: 'Archived', variant: 'outline' },
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const c = config[status] ?? { label: status, variant: 'default' as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}