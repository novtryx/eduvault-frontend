import { apiClient } from '@/lib/api-client';
import type { Subscription } from '@/types/entities';

// Mirrors SubscriptionsController — GET/POST live under
// /schools/:schoolId/subscription. There is currently no endpoint to
// list available Plans (no GET /plans anywhere in the backend), so this
// layer can only report the school's CURRENT subscription; it can't yet
// power a "choose a plan" screen. See features/subscriptions/hooks.ts
// for how the UI degrades gracefully in that case.
export const subscriptionApi = {
  getCurrent: (schoolId: string) => apiClient.get<Subscription>('/subscription', { schoolId }),

  initialize: (schoolId: string, planId: string) =>
    apiClient.post<{ authorizationUrl: string; reference: string }>(
      '/subscription/initialize',
      { planId },
      { schoolId },
    ),
};

// BillingCallbackController is NOT school-scoped (@Controller('billing'),
// reached via Paystack's redirect which only carries `?reference=`) —
// called without the apiClient `schoolId` option on purpose.
export const billingApi = {
  verifyCallback: (reference: string) =>
    apiClient.get<Subscription>('/billing/callback', { query: { reference } }),
};