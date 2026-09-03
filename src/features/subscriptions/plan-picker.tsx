'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useInitializeSubscription, usePlans } from '@/features/subscriptions/hooks';
import { ApiError } from '@/lib/api-client';
import { formatKobo } from '@/lib/currency';
import type { PlanBillingCycle } from '@/types/entities';

interface PlanPickerProps {
  schoolId: string | null;
  currentPlanId?: string | null;
}

// GET /plans returns one row PER (family, billing cycle) pair — e.g.
// "starter_monthly" and "starter_annual" are two separate rows sharing
// familyKey "starter". Grouping by familyKey here reconstructs the
// "one card, monthly/annual toggle" picker the pricing data implies,
// rather than rendering every row as its own flat card.
export function PlanPicker({ schoolId, currentPlanId }: PlanPickerProps) {
  const plansQuery = usePlans();
  const initializeMutation = useInitializeSubscription(schoolId);
  const { toast } = useToast();
  const [cycle, setCycle] = React.useState<PlanBillingCycle>('MONTHLY');
  const [subscribingKey, setSubscribingKey] = React.useState<string | null>(null);

  const families = React.useMemo(() => {
    if (!plansQuery.data) return [];
    const byFamily = new Map<string, typeof plansQuery.data>();
    for (const plan of plansQuery.data) {
      const list = byFamily.get(plan.familyKey) ?? [];
      list.push(plan);
      byFamily.set(plan.familyKey, list);
    }
    return Array.from(byFamily.values())
      .map((variants) => ({
        variants,
        monthly: variants.find((p) => p.billingCycle === 'MONTHLY'),
        annual: variants.find((p) => p.billingCycle === 'ANNUAL'),
        sortOrder: Math.min(...variants.map((p) => p.sortOrder)),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [plansQuery.data]);

  async function handleSubscribe(planId: string) {
    if (!schoolId) return;
    setSubscribingKey(planId);
    try {
      const result = await initializeMutation.mutateAsync(planId);
      // Full-page redirect to Paystack checkout — not a client-side
      // route change. Paystack redirects back to /billing/callback
      // (see BillingCallbackPage) once the payment completes.
      window.location.href = result.authorizationUrl;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Couldn't start checkout",
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
      setSubscribingKey(null);
    }
  }

  if (plansQuery.isLoading) {
    return <p className="text-[13px] text-navy-400">Loading plans…</p>;
  }

  if (plansQuery.isError || families.length === 0) {
    return (
      <p className="text-[13px] text-navy-400">
        Plans aren't available right now. Please try again shortly, or contact support.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <Tabs value={cycle} onValueChange={(v) => setCycle(v as PlanBillingCycle)}>
        <TabsList>
          <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
          <TabsTrigger value="ANNUAL">Annual</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-3">
        {families.map(({ monthly, annual }) => {
          const plan = cycle === 'ANNUAL' ? (annual ?? monthly) : (monthly ?? annual);
          if (!plan) return null;
          const isCurrent = plan.id === currentPlanId;
          const isSubscribing = subscribingKey === plan.id;

          return (
            <div
              key={plan.familyKey}
              className={`flex flex-col rounded-xl border p-5 ${isCurrent ? 'border-navy-900' : 'border-border'}`}
            >
              <p className="text-[14px] font-semibold text-navy-900">{plan.name}</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-[22px] font-semibold text-navy-900">{formatKobo(plan.priceKobo)}</span>
                <span className="text-[12px] text-navy-400">/ {cycle === 'ANNUAL' ? 'year' : 'month'}</span>
              </div>
              {plan.comparePriceKobo && plan.comparePriceKobo > plan.priceKobo && (
                <p className="mt-0.5 text-[12px] text-navy-400 line-through">{formatKobo(plan.comparePriceKobo)}</p>
              )}
              <p className="mt-1 text-[12.5px] text-navy-400">
                {plan.studentLimit ? `Up to ${plan.studentLimit} students` : 'Unlimited students'}
              </p>

              {plan.features.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[12.5px] text-navy-600">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5">
                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : (
                  <Button className="w-full" loading={isSubscribing} onClick={() => handleSubscribe(plan.id)}>
                    Subscribe
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}