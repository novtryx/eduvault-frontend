import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The whole authenticated app, plus the token-scoped parent
        // payment pages, are private/dynamic and have nothing useful
        // to offer a crawler — keep the index focused on the public
        // marketing pages.
        disallow: ['/dashboard', '/students', '/payments', '/settings', '/pay/', '/billing/', '/staff/'],
      },
    ],
    sitemap: 'https://school.novtryx.com/sitemap.xml',
  };
}