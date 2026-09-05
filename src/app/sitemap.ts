import type { MetadataRoute } from 'next';

const BASE_URL = 'https://school.novtryx.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/pricing', '/about', '/privacy', '/terms'];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.6,
  }));
}