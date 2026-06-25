import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const host = req.headers.host ?? 'localhost:3000';
  const base = `https://${host}`;
  const urls = [`${base}/learn`, `${base}/store`, `${base}/listings`];
  const body = urls.map((u) => `<url><loc>${u}</loc></url>`).join('');
  res.setHeader('Content-Type', 'text/xml');
  res.write(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`,
  );
  res.end();
  return { props: {} };
};

export default function SiteMap() {
  return null;
}
