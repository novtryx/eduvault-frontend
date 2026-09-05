import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  description:
    'Know exactly who has paid, who owes, and how much has been collected — a premium fee and payment management platform built for Nigerian private schools.',
  alternates: { canonical: '/' },
};

const outcomes = [
  {
    title: 'Record a payment in seconds',
    description:
      'Search for a student, enter the amount, pick a method — cash, transfer, POS, or online. Done. No spreadsheets, no end-of-term reconciliation.',
  },
  {
    title: 'See who owes, at a glance',
    description:
      'A single list of every student with a balance, sorted by how much and how overdue. Send a reminder or take a payment right from that list.',
  },
  {
    title: 'Let parents pay online',
    description:
      'Send a parent a link by email. They see exactly what they owe and pay by card or transfer — no account, no app, no phone call to your office.',
  },
  {
    title: 'One number for the whole term',
    description:
      'Expected fees, what has actually come in, and what is still outstanding — one collection rate you can state in a governors\u2019 meeting without checking a spreadsheet first.',
  },
];

const trustPoints = [
  'Every payment recorded against a specific student, term, and staff member',
  'Reversals are tracked, never silently deleted',
  'Receipts numbered automatically, in your school\u2019s own sequence',
  'Bank-grade payment processing via Paystack for online payments',
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="max-w-2xl">
          <h1 className="text-[40px] font-semibold leading-[1.08] tracking-tight text-navy-900 sm:text-[56px]">
            Know exactly who has paid, who owes, and how much you&apos;ve collected.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-navy-500">
            Novtryx School replaces the fee ledger, the reminder calls, and the end-of-term guesswork with one
            clear system built for how Nigerian private schools actually collect fees.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>

        {/* A single, characteristic figure — this product's entire premise
            in one glance, rather than an abstract illustration. */}
        <div className="mt-16 rounded-xl border border-border bg-white p-8 shadow-card sm:p-10">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-[13px] text-navy-400">Expected this term</p>
              <p className="mt-2 text-[32px] font-semibold tracking-tight text-navy-900">₦42,700,000</p>
            </div>
            <div>
              <p className="text-[13px] text-navy-400">Collected</p>
              <p className="mt-2 text-[32px] font-semibold tracking-tight text-navy-900">₦36,100,000</p>
            </div>
            <div>
              <p className="text-[13px] text-navy-400">Outstanding</p>
              <p className="mt-2 text-[32px] font-semibold tracking-tight text-danger">₦6,600,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="border-t border-border bg-surface-muted">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-xl">
            <h2 className="text-[28px] font-semibold tracking-tight text-navy-900 sm:text-[34px]">
              Built around four things a school actually needs to do
            </h2>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2">
            {outcomes.map((outcome) => (
              <div key={outcome.title}>
                <h3 className="text-[17px] font-medium text-navy-900">{outcome.title}</h3>
                <p className="mt-2.5 max-w-md text-[14.5px] leading-relaxed text-navy-500">{outcome.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-16">
          <div>
            <h2 className="text-[28px] font-semibold tracking-tight text-navy-900 sm:text-[34px]">
              This is serious software for serious money.
            </h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-navy-500">
              Every naira that moves through Novtryx School is attributed, timestamped, and auditable. Nothing is
              ever quietly overwritten.
            </p>
          </div>
          <ul className="space-y-4">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span className="text-[14.5px] text-navy-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-24">
          <h2 className="text-[28px] font-semibold tracking-tight text-navy-900 sm:text-[34px]">
            Set up your school in a few minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] text-navy-500">
            No card required to start. Add your classes, set your fees, and record your first payment today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}