import type { Metadata } from 'next';
import type { Settings } from '@prisma/client';
import { formatAddress } from './data';

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function buildMetadata(s: Settings): Metadata {
  const title = s.seoTitle || `${s.shopName} | อะไหล่ยนต์ ป่าซาง ลำพูน`;
  const description = s.seoDescription || s.tagline;
  const keywords = (s.seoKeywords || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
  const url = siteUrl();
  const ogImage = s.ogImage || s.heroImage || s.logoImage || '';

  return {
    metadataBase: new URL(url),
    title: { default: title, template: `%s | ${s.shopName}` },
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'th_TH',
      url,
      siteName: s.shopName,
      title,
      description,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: s.shopName }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    robots: { index: true, follow: true },
  };
}

// JSON-LD แบบ AutoPartsStore
export function buildJsonLd(s: Settings) {
  const url = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoPartsStore',
    name: s.shopName,
    description: s.seoDescription || s.tagline,
    url,
    image: s.ogImage || s.heroImage || s.logoImage || undefined,
    telephone: s.phone2 || s.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [s.addressLine, s.subDistrict ? `ต.${s.subDistrict}` : '']
        .filter(Boolean)
        .join(' '),
      addressLocality: s.district ? `อ.${s.district}` : undefined,
      addressRegion: s.province ? `จ.${s.province}` : undefined,
      postalCode: s.postalCode || undefined,
      addressCountry: 'TH',
    },
    geo:
      s.latitude && s.longitude
        ? { '@type': 'GeoCoordinates', latitude: s.latitude, longitude: s.longitude }
        : undefined,
    openingHours: s.openHours || undefined,
    sameAs: [s.facebookUrl].filter(Boolean),
    areaServed: 'ป่าซาง, ลำพูน',
    fullAddress: formatAddress(s),
  };
}
