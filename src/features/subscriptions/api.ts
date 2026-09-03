import { apiClient } from '@/lib/api-client';
import type { PublicPlan, Subscription } from '@/types/entities';

// Mirrors SubscriptionsController — GET/POST live under
// /schools/:schoolId/subscription. Plan selection is powered by the
// public GET /plans endpoint below (plansApi) — see the Settings
// Subscription tab for how initialize()'s authorizationUrl is used to
// send the Owner to Paystack checkout.
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

// Public — GET /plans, no schoolId. Same catalog data a prospective
// school sees on a pricing page before registering; also used
// post-login for an Owner's upgrade screen.
export const plansApi = {
  list: () => apiClient.get<PublicPlan[]>('/plans'),
};