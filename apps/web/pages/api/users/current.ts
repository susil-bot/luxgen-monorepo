import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tenant } = req.query;

  if (!tenant) {
    return res.status(400).json({ error: 'Tenant parameter is required' });
  }

  try {
    // For now, return mock user data based on tenant
    // In a real app, this would fetch from the database
    const mockUserData = {
      id: `user-${tenant}-001`,
      name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} User`,
      email: `user@${tenant}.com`,
      role: 'ADMIN',
      avatar: `/avatars/${tenant}-user.jpg`,
      tenant: {
        id: tenant,
        name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Company`,
        subdomain: tenant,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(200).json(mockUserData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
