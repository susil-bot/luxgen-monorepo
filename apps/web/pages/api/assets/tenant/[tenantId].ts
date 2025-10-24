import { NextApiRequest, NextApiResponse } from 'next';
import { getBrandAssetsForTenant, defaultAssets } from '@luxgen/ui/src/Assets/DefaultBrandAssets';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { tenantId } = req.query;

    if (!tenantId || typeof tenantId !== 'string') {
      return res.status(400).json({ message: 'Tenant ID is required' });
    }

    // Get tenant-specific brand assets
    const brandAssets = getBrandAssetsForTenant(tenantId);
    
    // Filter assets for this tenant
    const tenantAssets = defaultAssets.filter(asset => 
      asset.tenant === tenantId || asset.global
    );

    const response = {
      assets: tenantAssets,
      brandAssets,
      tenantId,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching tenant assets:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
