import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern use of Novtryx School by schools and their staff.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-[13px] font-medium text-navy-400">Legal</p>
      <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-navy-900 sm:text-[38px]">
        Terms of Service
      </h1>
      <p className="mt-3 text-[13.5px] text-navy-400">Last updated: [date]</p>

      <div className="prose-legal mt-10 space-y-10 text-[14.5px] leading-relaxed text-navy-600">
        <section>
          <p>
            This is a template terms of service for Novtryx School, written to reflect what the product actually
            does. It has not been reviewed by a lawyer and should be before you rely on it. Replace the
            bracketed placeholders with your company's real details.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">1. Agreement</h2>
          <p className="mt-3">
            These terms govern use of Novtryx School (the "Service") by a school and its staff (the "Customer").
            By creating an account, the Customer agrees to these terms on behalf of itself and its staff.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">2. What the Service does</h2>
          <p className="mt-3">
            Novtryx School is software for recording fee structures, payments, and balances, generating
            receipts, and collecting fees from parents online. It is a record-keeping and collection tool. It
            does not itself hold school funds; online payments are processed and settled by Paystack directly to
            the school's connected bank account.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">3. Accounts and responsibility</h2>
          <p className="mt-3">
            The Customer is responsible for the accuracy of data entered into the Service, including fee
            amounts, student records, and payments recorded by its staff, and for keeping staff account
            credentials secure. The Customer is responsible for managing which staff have access to which
            actions, using the roles and permissions the Service provides.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">4. Subscriptions and billing</h2>
          <p className="mt-3">
            Paid plans are billed in advance on a monthly or annual cycle, as selected by the Customer. Fees are
            non-refundable except where required by law. [Trial period terms, if any, go here.]
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">5. Online payments</h2>
          <p className="mt-3">
            Online payments made by parents are processed by Paystack under Paystack's own terms. Novtryx
            School is not a party to the payment itself and is not responsible for payment processing failures,
            chargebacks, or disputes between a parent and Paystack, though we will assist a school in
            investigating a discrepancy in its own records.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">6. Data ownership</h2>
          <p className="mt-3">
            The Customer owns the student, fee, and payment data it enters into the Service. On request, we
            will provide an export of that data in a standard format, and will delete it within [X days] of
            account closure except where retention is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">7. Availability</h2>
          <p className="mt-3">
            We aim for the Service to be reliably available but do not guarantee uninterrupted access. We will
            give reasonable notice of planned maintenance where practical.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">8. Termination</h2>
          <p className="mt-3">
            Either party may terminate a subscription as described at signup. On termination, the Customer's
            access ends at the close of the current billing period, and data handling follows Section 6.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">9. Limitation of liability</h2>
          <p className="mt-3">
            [Standard limitation-of-liability language goes here, reviewed by counsel for your jurisdiction.]
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">10. Changes to these terms</h2>
          <p className="mt-3">
            We will update the date at the top of this page when these terms change, and notify the Customer of
            material changes.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">11. Contact</h2>
          <p className="mt-3">
            Questions about these terms can be sent to{' '}
            <a href="mailto:info@novtryx.com" className="font-medium text-navy-900 hover:underline">
              info@novtryx.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}