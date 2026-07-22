const MODEL_FALLBACK_CHAIN = [
  'qwen3.6',
  'qwen2.5-coder:7b',
  'qwen2.5-coder:14b',
  'qwen2.5-coder:1.5b',
  'deepseek-coder-v2:lite',
  'llama3.2:3b',
  'llama3.1:8b',
  'mistral-nemo:12b',
  'mistral',
];

const MODELS_WITH_TOOLS = [
  'qwen3.6',
  'qwen3',
  'qwen2.5-coder',
  'deepseek-coder-v2',
  'llama3.1',
  'llama3.2',
  'mistral-nemo',
  'mistral-small',
  'mistral',
  'codellama',
];

export const MODEL_META: Record<string, { name: string; speed: string; quality: string; supportsTools: boolean }> = {
  'qwen3.6': { name: 'Qwen 3.6 (MoE)', speed: 'slow', quality: 'best', supportsTools: true },
  'qwen2.5-coder:1.5b': { name: 'Qwen 2.5 Coder 1.5B', speed: 'fast', quality: 'good', supportsTools: true },
  'qwen2.5-coder:7b': { name: 'Qwen 2.5 Coder 7B', speed: 'medium', quality: 'excellent', supportsTools: true },
  'qwen2.5-coder:14b': { name: 'Qwen 2.5 Coder 14B', speed: 'slow', quality: 'best', supportsTools: true },
  'deepseek-coder-v2:lite': {
    name: 'DeepSeek Coder V2 Lite',
    speed: 'medium',
    quality: 'excellent',
    supportsTools: true,
  },
  'llama3.2:3b': { name: 'Llama 3.2 3B', speed: 'fast', quality: 'good', supportsTools: true },
  'llama3.1:8b': { name: 'Llama 3.1 8B', speed: 'medium', quality: 'excellent', supportsTools: true },
  'mistral-nemo:12b': { name: 'Mistral Nemo 12B', speed: 'slow', quality: 'excellent', supportsTools: true },
  mistral: { name: 'Mistral 7B', speed: 'medium', quality: 'good', supportsTools: true },
};

export function supportsToolCalling(modelName: string): boolean {
  const base = modelName.split(':')[0].toLowerCase();
  return MODELS_WITH_TOOLS.some((name) => base.startsWith(name) || base === name);
}

export async function findAvailableModel(
  ollamaHost: string,
  preferredModel?: string,
): Promise<{ model: string; fromFallback: boolean } | null> {
  try {
    const r = await fetch(`${ollamaHost}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return null;

    const data = (await r.json()) as { models?: Array<{ name: string }> };
    const availableModels = (data.models || []).map((m) => m.name);

    if (preferredModel) {
      const prefBase = preferredModel.split(':')[0];
      const match = availableModels.find((name) => name.startsWith(prefBase));
      if (match) {
        return { model: match, fromFallback: false };
      }
    }

    for (const model of MODEL_FALLBACK_CHAIN) {
      const base = model.split(':')[0];
      const match = availableModels.find((name) => name.startsWith(base));
      if (match) {
        return { model: match, fromFallback: true };
      }
    }

    const toolModel = availableModels.find((m) => supportsToolCalling(m));
    if (toolModel) {
      return { model: toolModel, fromFallback: true };
    }

    if (availableModels.length > 0) {
      return { model: availableModels[0], fromFallback: true };
    }

    return null;
  } catch {
    return null;
  }
}

export interface OllamaHealthResult {
  ok: boolean;
  hasModel: boolean;
  model: string;
  activeModel: string | null;
  usingFallback: boolean;
  models: Array<{
    name: string;
    supportsTools: boolean;
    speed: string;
    quality: string;
  }>;
}

export async function checkOllamaHealth(ollamaHost: string, preferredModel: string): Promise<OllamaHealthResult> {
  try {
    const r = await fetch(`${ollamaHost}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!r.ok) throw new Error('not ok');

    const data = (await r.json()) as { models?: Array<{ name: string }> };
    const models = (data.models || []).map((m) => m.name);
    const hasModel = models.some((name) => name.startsWith(preferredModel.split(':')[0]));
    const available = await findAvailableModel(ollamaHost, preferredModel);

    const enrichedModels = models.map((m) => {
      const baseKey = Object.keys(MODEL_META).find((k) => m.startsWith(k.split(':')[0]));
      const meta = baseKey ? MODEL_META[baseKey] : null;
      const baseMeta = meta || { name: 'Unknown Model', speed: 'unknown', quality: 'unknown' };
      return {
        name: m,
        supportsTools: supportsToolCalling(m),
        speed: baseMeta.speed,
        quality: baseMeta.quality,
      };
    });

    return {
      ok: true,
      hasModel,
      model: preferredModel,
      activeModel: available?.model || preferredModel,
      usingFallback: available?.fromFallback || false,
      models: enrichedModels,
    };
  } catch {
    return {
      ok: false,
      hasModel: false,
      model: preferredModel,
      activeModel: null,
      usingFallback: false,
      models: [],
    };
  }
}

export async function pingOllama(ollamaHost: string): Promise<boolean> {
  try {
    const ping = await fetch(`${ollamaHost}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return ping.ok;
  } catch {
    return false;
  }
}
