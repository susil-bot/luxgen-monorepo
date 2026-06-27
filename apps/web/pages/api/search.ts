import type { NextApiRequest, NextApiResponse } from 'next';

interface SearchHit {
  type: 'course' | 'user';
  id: string;
  label: string;
  href: string;
}

/** Lightweight search API for NavBar global search (UI-159). */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  const tenant = typeof req.query.tenant === 'string' ? req.query.tenant : 'demo';

  if (!q) {
    return res.status(200).json({ hits: [] as SearchHit[] });
  }

  // Client-side GraphQL search is primary; this endpoint supports integrations and future SSR.
  return res.status(200).json({
    hits: [] as SearchHit[],
    redirect: `/search?q=${encodeURIComponent(q)}&tenant=${encodeURIComponent(tenant)}`,
  });
}
