import { Badge } from '@/components/ui/badge';
import type { SubscriptionStatus } from '@/types/entities';

const config: Record<SubscriptionStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'outline' }> = {
  TRIALING: { label: 'Trial', variant: 'default' },
  ACTIVE: { label: 'Active', variant: 'success' },
  PAST_DUE: { label: 'Past Due', variant: 'warning' },
  CANCELED: { label: 'Canceled', variant: 'outline' },
  EXPIRED: { label: 'Expired', variant: 'danger' },
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const c = config[status] ?? { label: status, variant: 'default' as const };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}