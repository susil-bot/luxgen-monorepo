import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { User } from '@luxgen/db';

interface JwtPayload {
  id: string;
  tenant: string;
}

const MAX_AVATAR_BYTES = 512_000;
const ALLOWED_PREFIXES = ['data:image/jpeg;', 'data:image/png;', 'data:image/webp;', 'data:image/gif;'];

function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}

function isValidAvatarUrl(value: string): boolean {
  if (value.startsWith('https://') || value.startsWith('http://')) return value.length <= 2048;
  if (!ALLOWED_PREFIXES.some((p) => value.startsWith(p))) return false;
  const base64Part = value.split(',')[1];
  if (!base64Part) return false;
  const approxBytes = Math.ceil((base64Part.length * 3) / 4);
  return approxBytes <= MAX_AVATAR_BYTES;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authToken = req.headers.authorization?.replace('Bearer ', '');
  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const payload = verifyToken(authToken);
  if (!payload?.id) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { avatarUrl } = req.body as { avatarUrl?: string };
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    return res.status(400).json({ error: 'avatarUrl is required' });
  }

  if (!isValidAvatarUrl(avatarUrl)) {
    return res.status(400).json({
      error: 'Invalid avatar',
      message: 'Provide an HTTPS URL or a base64 image data URL (jpeg/png/webp/gif, max 500KB)',
    });
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: payload.id, tenant: payload.tenant },
      { $set: { avatar: avatarUrl } },
      { new: true },
    ).populate('tenant');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      avatar: user.avatar || avatarUrl,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ error: 'Failed to save avatar' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '600kb' } },
};
