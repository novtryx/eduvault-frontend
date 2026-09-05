import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, per-school pricing for Novtryx School — no setup fee, no card required to start. Every plan includes online parent payments, receipts, and reporting.',
  alternates: { canonical: '/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}