import Image from 'next/image';
import Link from 'next/link';

const footerLinks = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Novtryx School" width={22} height={22} className="rounded-md" />
          <span className="text-[13.5px] text-navy-500">
            © {new Date().getFullYear()} Novtryx School. All rights reserved.
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-[13.5px] text-navy-400 hover:text-navy-900">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}