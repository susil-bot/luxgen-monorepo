import type { NextApiRequest, NextApiResponse } from 'next';
import { checkOllamaHealth } from '@luxgen/agent';
import { getOllamaUrl } from '@luxgen/config';

export { findAvailableModel } from '@luxgen/agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const OLLAMA_HOST = getOllamaUrl();
  const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';

  const result = await checkOllamaHealth(OLLAMA_HOST, OLLAMA_MODEL);
  res.status(200).json(result);
}
