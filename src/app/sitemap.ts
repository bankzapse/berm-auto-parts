import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const routes = ['', '/products', '/gallery', '/about', '/contact'];
  const now = new Date();
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: r === '' ? 'daily' : 'weekly',
    priority: r === '' ? 1 : 0.8,
  }));
}
