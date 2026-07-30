import type { Metadata } from 'next';
import { Sarabun } from 'next/font/google';
import './globals.css';
import { getSettings } from '@/lib/data';
import { buildMetadata, buildJsonLd } from '@/lib/seo';

const thai = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-thai',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata(settings);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const jsonLd = buildJsonLd(settings);

  return (
    <html lang="th" className={thai.variable}>
      <body>
        <script
          type="application/ld+json"
          // escape '<' กัน </script> breakout (stored XSS จากค่าในตั้งค่า)
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        {children}
      </body>
    </html>
  );
}
