import Image from 'next/image';
import { Check } from 'lucide-react';

// Shown on the left of /login, /register, and /staff/accept-invite —
// deliberately reuses the same figures and trust language as the
// marketing homepage hero (see (marketing)/page.tsx) so arriving here
// from the homepage feels like the same product, not a handoff to a
// separate "app" with different branding.
const trustPoints = [
  'Every payment attributed to a student, term, and staff member',
  'Reversals are tracked, never silently deleted',
  'Bank-grade processing via Paystack for online payments',
];

export function AuthBrandPanel() {
  return (
    <div className="relative hidden w-[44%] max-w-[560px] flex-col justify-between overflow-hidden bg-navy-900 px-12 py-12 text-white lg:flex xl:px-16">
      <div className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="" width={28} height={28} className="rounded-md" />
        <span className="text-[15px] font-semibold tracking-tight">Novtryx School</span>
      </div>

      <div>
        <p className="text-[26px] font-semibold leading-[1.2] tracking-tight xl:text-[30px]">
          Know exactly who has paid, who owes, and how much you&apos;ve collected.
        </p>

        <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[11.5px] text-white/50">Expected</p>
              <p className="mt-1.5 text-[17px] font-semibold tracking-tight">₦42.7M</p>
            </div>
            <div>
              <p className="text-[11.5px] text-white/50">Collected</p>
              <p className="mt-1.5 text-[17px] font-semibold tracking-tight">₦36.1M</p>
            </div>
            <div>
              <p className="text-[11.5px] text-white/50">Outstanding</p>
              <p className="mt-1.5 text-[17px] font-semibold tracking-tight text-white">₦6.6M</p>
            </div>
          </div>
        </div>
      </div>

      <ul className="space-y-3">
        {trustPoints.map((point) => (
          <li key={point} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span className="text-[13.5px] text-white/70">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}