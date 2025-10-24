import { NextApiRequest, NextApiResponse } from 'next';
import { defaultAssets, luxgenBrandAssets } from '@luxgen/ui/src/Assets/DefaultBrandAssets';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Return global assets and brand assets
    const response = {
      assets: defaultAssets.filter(asset => asset.global),
      brandAssets: luxgenBrandAssets,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching global assets:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
