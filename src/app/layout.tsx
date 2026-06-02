import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import SessionProvider from '@/components/providers/SessionProvider';
import '../styles/globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Coffee Shop - Premium Coffee & Cozy Atmosphere',
  description: 'Discover our handcrafted coffee, delicious light bites, and warm atmosphere. Visit us for the perfect coffee experience.',
  openGraph: {
    title: 'Coffee Shop - Premium Coffee & Cozy Atmosphere',
    description: 'Discover our handcrafted coffee, delicious light bites, and warm atmosphere. Visit us for the perfect coffee experience.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
