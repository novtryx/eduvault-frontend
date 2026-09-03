import { Badge } from '@/components/ui/badge';
import type { PaymentMethod } from '@/types/entities';

const labels: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  POS: 'POS',
};

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  return <Badge variant="outline">{labels[method] ?? method}</Badge>;
}
