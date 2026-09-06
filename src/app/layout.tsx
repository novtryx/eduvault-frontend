import type { Metadata } from 'next';
import { Saira } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const saira = Saira({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});


export const metadata: Metadata = {
  metadataBase: new URL('https://school.novtryx.com'),

  title: {
    default: 'Novtryx School — School Fee Management for Nigerian Schools',
    template: '%s — Novtryx School',
  },

  description:
    'Know exactly who has paid, who owes, and how much has been collected. Novtryx School is a premium fee and payment management platform built for Nigerian private schools.',

  keywords: [
    'school fee management',
    'Nigerian schools',
    'fee collection software',
    'school payments Nigeria',
  ],

  openGraph: {
    type: 'website',
    url: 'https://school.novtryx.com',
    locale: 'en_NG',
    siteName: 'Novtryx School',
    title: 'Novtryx School — School Fee Management for Nigerian Schools',
    description:
      'Know exactly who has paid, who owes, and how much has been collected. Built for Nigerian private schools.',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'Novtryx School',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Novtryx School — School Fee Management for Nigerian Schools',
    description:
      'Know exactly who has paid, who owes, and how much has been collected.',
    images: ['/og-home.png'],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={saira.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}