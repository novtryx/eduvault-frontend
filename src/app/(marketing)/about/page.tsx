import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Novtryx School is built for the people who run the numbers at Nigerian private schools, so every naira collected is accounted for.',
  alternates: { canonical: '/about' },
};

const principles = [
  {
    title: 'Built for one job',
    description:
      "Novtryx School does not try to be a full school-management suite with timetables and gradebooks bolted on. It does one thing, fee collection, and does it precisely.",
  },
  {
    title: 'Designed for Nigeria',
    description:
      'Amounts in naira and kobo, Nigerian bank transfers and POS as first-class payment methods, and Paystack for online payments, not a foreign template with the currency symbol swapped.',
  },
  {
    title: 'Nothing disappears',
    description:
      "A reversed payment is marked reversed, with a reason, not deleted. A staff member's actions are logged. If a governor or auditor asks a question, there is a real answer.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="max-w-2xl">
        <h1 className="text-[36px] font-semibold leading-tight tracking-tight text-navy-900 sm:text-[44px]">
          We built this for the person who has to answer for the money.
        </h1>
        <p className="mt-5 text-[15.5px] leading-relaxed text-navy-500">
          Every private school has someone, an owner, a bursar, an admin officer, who is expected to know
          precisely how fee collection is going. Not roughly. Precisely. Novtryx School exists so that answer
          is always one glance away, not a weekend spent reconciling a spreadsheet against a bank statement.
        </p>
      </div>

      <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {principles.map((principle) => (
          <div key={principle.title}>
            <h2 className="text-[16px] font-medium text-navy-900">{principle.title}</h2>
            <p className="mt-2.5 text-[14px] leading-relaxed text-navy-500">{principle.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 border-t border-border pt-10">
        <h2 className="text-[22px] font-semibold tracking-tight text-navy-900">Questions before you start?</h2>
        <p className="mt-2 max-w-md text-[14.5px] text-navy-500">
          Write to us at{' '}
          <a href="mailto:info@novtryx.com" className="font-medium text-navy-900 hover:underline">
            info@novtryx.com
          </a>{' '}
          and we will help you get set up.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/register">Start free</Link>
        </Button>
      </div>
    </div>
  );
}