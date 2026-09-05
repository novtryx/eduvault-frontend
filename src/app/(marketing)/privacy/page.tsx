import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Novtryx School collects, uses, and protects data for schools, staff, students, and parents.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-[13px] font-medium text-navy-400">Legal</p>
      <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-navy-900 sm:text-[38px]">Privacy Policy</h1>
      <p className="mt-3 text-[13.5px] text-navy-400">Last updated: [date]</p>

      <div className="prose-legal mt-10 space-y-10 text-[14.5px] leading-relaxed text-navy-600">
        <section>
          <p>
            This is a template privacy policy for Novtryx School, written to reflect what the product actually
            does. It has not been reviewed by a lawyer and should be before you rely on it. Replace the bracketed
            placeholders with your school's or company's real details.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">1. Who this applies to</h2>
          <p className="mt-3">
            Novtryx School ("we", "us") provides fee management software to schools. This policy covers three
            kinds of people: school staff who use the software directly, students and parents whose fee and
            payment records are stored in it, and visitors to this website.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">2. What we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Staff accounts: name, email address, and role at the school.</li>
            <li>
              Student records: name, admission number, class, parent or guardian name, and parent contact
              details (phone and email), entered by school staff.
            </li>
            <li>
              Payment records: amounts, dates, payment method, and the staff member who recorded each payment.
            </li>
            <li>
              Online payments: when a parent pays a fee online, payment processing is handled by Paystack.
              Novtryx School receives confirmation that a payment succeeded and its amount and reference, not
              full card details.
            </li>
            <li>Website usage: standard technical data like IP address and browser type, for security and analytics.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">3. How we use it</h2>
          <p className="mt-3">
            Data is used to operate the fee management service: recording payments, calculating balances,
            generating receipts, sending payment reminders and payment links, and providing reports to school
            staff. We do not sell student, parent, or payment data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">4. Who we share it with</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Paystack, to process online payments.</li>
            <li>[Your hosting and email providers], to run the application and deliver emails such as receipts and payment links.</li>
            <li>A school's own staff, according to the permissions their school assigns them.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">5. Data retention</h2>
          <p className="mt-3">
            Payment and student records are retained for as long as a school's account is active, and for [X
            years] afterward to satisfy typical financial record-keeping requirements, unless a school requests
            earlier deletion where we are not legally required to retain the data.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">6. Your rights</h2>
          <p className="mt-3">
            A parent or staff member who wants to know what data we hold about them, or wants it corrected or
            deleted, should first contact their school, since the school controls its own records. You can also
            reach us directly at{' '}
            <a href="mailto:info@novtryx.com" className="font-medium text-navy-900 hover:underline">
              info@novtryx.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">7. Changes to this policy</h2>
          <p className="mt-3">
            We will update the date at the top of this page when this policy changes, and notify schools of
            material changes.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-medium text-navy-900">8. Contact</h2>
          <p className="mt-3">
            Questions about this policy can be sent to{' '}
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