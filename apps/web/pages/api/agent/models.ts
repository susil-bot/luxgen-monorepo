import type { NextApiRequest, NextApiResponse } from 'next';
import { getOllamaUrl } from '@luxgen/config';

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  details?: {
    parameter_size?: string;
    family?: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OLLAMA_HOST = getOllamaUrl();

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return res.status(502).json({ models: [], error: 'Ollama returned non-OK status' });
    }

    const data = await response.json();
    const models: OllamaModel[] = (data.models || []).map((m: any) => ({
      name: m.name,
      size: m.size,
      modified_at: m.modified_at,
      details: m.details,
    }));

    return res.status(200).json({ models, count: models.length });
  } catch (err: any) {
    // Ollama offline — return empty list, not a 500
    return res.status(200).json({ models: [], error: err.message });
  }
}
