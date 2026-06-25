import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { Course, Group, User, Automation } from '@luxgen/db';

interface JwtPayload {
  id: string;
  tenant: string;
}

interface SearchHit {
  id: string;
  type: 'course' | 'user' | 'group' | 'automation';
  title: string;
  subtitle?: string;
  href: string;
}

function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authToken = req.headers.authorization?.replace('Bearer ', '');
  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const payload = verifyToken(authToken);
  if (!payload?.tenant) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const q = String(req.query.q ?? '')
    .trim()
    .toLowerCase();
  if (q.length < 2) {
    return res.status(200).json({ results: [] as SearchHit[] });
  }

  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const pattern = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const tenantId = payload.tenant;

  try {
    const [courses, users, groups, automations] = await Promise.all([
      Course.find({ tenant: tenantId, $or: [{ title: pattern }, { description: pattern }] })
        .limit(limit)
        .select('title description'),
      User.find({ tenant: tenantId, $or: [{ email: pattern }, { firstName: pattern }, { lastName: pattern }] })
        .limit(limit)
        .select('email firstName lastName'),
      Group.find({ tenant: tenantId, $or: [{ name: pattern }, { description: pattern }] })
        .limit(limit)
        .select('name description'),
      Automation.find({ tenantId, $or: [{ name: pattern }, { description: pattern }] })
        .limit(limit)
        .select('name description'),
    ]);

    const results: SearchHit[] = [
      ...courses.map((c) => ({
        id: String(c._id),
        type: 'course' as const,
        title: c.title,
        subtitle: c.description?.slice(0, 80),
        href: `/products/${c._id}`,
      })),
      ...users.map((u) => ({
        id: String(u._id),
        type: 'user' as const,
        title: `${u.firstName} ${u.lastName}`.trim() || u.email,
        subtitle: u.email,
        href: `/users/${u._id}`,
      })),
      ...groups.map((g) => ({
        id: String(g._id),
        type: 'group' as const,
        title: g.name,
        subtitle: g.description?.slice(0, 80),
        href: `/groups/${g._id}`,
      })),
      ...automations.map((a) => ({
        id: String(a._id),
        type: 'automation' as const,
        title: a.name,
        subtitle: a.description?.slice(0, 80),
        href: `/automations/tower/${a._id}`,
      })),
    ].slice(0, limit);

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Global search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
}
