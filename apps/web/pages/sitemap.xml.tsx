import type { GetServerSideProps } from 'next';

/** Minimal sitemap for public routes (UI-132). Extend with GraphQL course/listing queries when available. */
function buildSitemap(host: string, paths: string[]): string {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const base = `${protocol}://${host}`;
  const urls = paths
    .map(
      (path) => `  <url>
    <loc>${base}${path}</loc>
    <changefreq>weekly</changefreq>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

const PUBLIC_PATHS = ['/', '/listings', '/learn', '/store', '/login', '/register'];

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const host = req.headers.host ?? 'localhost:3000';
  const xml = buildSitemap(host, PUBLIC_PATHS);

  res.setHeader('Content-Type', 'text/xml');
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
