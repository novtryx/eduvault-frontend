'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlans } from '@/features/subscriptions/hooks';
import { formatKobo } from '@/lib/currency';
import type { PlanBillingCycle } from '@/types/entities';

// Pricing is a client component because it reads live plan data from
// GET /plans (the same public endpoint the in-app plan picker uses) —
// so a price change on the backend shows up here immediately, with no
// separate marketing-copy source of truth to fall out of sync.
export default function PricingPage() {
  const plansQuery = usePlans();
  const [cycle, setCycle] = React.useState<PlanBillingCycle>('MONTHLY');

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
        monthly: variants.find((p) => p.billingCycle === 'MONTHLY'),
        annual: variants.find((p) => p.billingCycle === 'ANNUAL'),
        sortOrder: Math.min(...variants.map((p) => p.sortOrder)),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [plansQuery.data]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="max-w-xl">
        <h1 className="text-[36px] font-semibold leading-tight tracking-tight text-navy-900 sm:text-[44px]">
          Simple pricing, per school.
        </h1>
        <p className="mt-4 text-[15.5px] leading-relaxed text-navy-500">
          No setup fee. No card required to start. Every plan includes online parent payments, receipts, and
          reporting — the difference is how many students you're managing.
        </p>
      </div>

      <div className="mt-10">
        <Tabs value={cycle} onValueChange={(v) => setCycle(v as PlanBillingCycle)}>
          <TabsList>
            <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
            <TabsTrigger value="ANNUAL">Annual</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {plansQuery.isLoading ? (
        <p className="mt-10 text-[14px] text-navy-400">Loading plans…</p>
      ) : plansQuery.isError || families.length === 0 ? (
        <p className="mt-10 text-[14px] text-navy-400">
          Plans aren't available right now. Please try again shortly.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {families.map(({ monthly, annual }, index) => {
            const plan = cycle === 'ANNUAL' ? (annual ?? monthly) : (monthly ?? annual);
            if (!plan) return null;
            // The middle tier is the one most schools land on — highlighted
            // as a genuine recommendation, not decoration, and only when
            // there are enough tiers for "middle" to mean anything.
            const isFeatured = families.length >= 3 && index === 1;

            return (
              <div
                key={plan.familyKey}
                className={`flex flex-col rounded-xl border p-7 ${
                  isFeatured ? 'border-navy-900 shadow-card' : 'border-border'
                }`}
              >
                {isFeatured && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-navy-900 px-2.5 py-1 text-[11.5px] font-medium text-white">
                    Most schools choose this
                  </span>
                )}
                <p className="text-[15px] font-semibold text-navy-900">{plan.name}</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-[30px] font-semibold tracking-tight text-navy-900">
                    {formatKobo(plan.priceKobo)}
                  </span>
                  <span className="text-[13px] text-navy-400">/ {cycle === 'ANNUAL' ? 'year' : 'month'}</span>
                </div>
                {plan.comparePriceKobo && plan.comparePriceKobo > plan.priceKobo && (
                  <p className="mt-0.5 text-[12.5px] text-navy-400 line-through">
                    {formatKobo(plan.comparePriceKobo)}
                  </p>
                )}
                <p className="mt-2 text-[13px] text-navy-400">
                  {plan.studentLimit ? `Up to ${plan.studentLimit} students` : 'Unlimited students'}
                </p>

                {plan.features.length > 0 && (
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-[13.5px] text-navy-600">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <Button className="mt-7 w-full" variant={isFeatured ? 'default' : 'secondary'} asChild>
                  <Link href="/register">Get started</Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-[13.5px] text-navy-400">
        Need a plan for more than one school, or a custom setup? <Link href="/about" className="font-medium text-navy-700 hover:underline">Get in touch</Link>.
      </p>
    </div>
  );
}