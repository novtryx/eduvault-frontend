import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export function MarketingNav() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Novtryx School" width={28} height={28} className="rounded-md" />
          <span className="text-[16px] font-semibold tracking-tight text-navy-900">Novtryx School</span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-[14px] text-navy-500 hover:text-navy-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}