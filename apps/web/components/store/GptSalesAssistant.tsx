import { useCallback, useState } from 'react';

import { categoryLabel } from '../../lib/store-categories';
import { formatStorefrontPrice } from '../../lib/storefront-format';

interface GptSalesAssistantProps {
  productTitle: string;
  productDescription: string;
  category: string;
  priceCents: number;
  currency: string;
  onBuy: () => void;
  buying?: boolean;
}

const PROMPTS = ['Why this pick?', 'What size fits?', 'Compare similar', 'Ready to buy'];

function buildReply(prompt: string, title: string, category: string, price: string): string {
  const cat = categoryLabel(category);
  if (prompt.includes('Why')) {
    return `This ${cat.toLowerCase()} pick — "${title}" — is curated for you. High intent, instant access, zero friction. ${price} and you're in.`;
  }
  if (prompt.includes('size') || prompt.includes('fits')) {
    return `GPT matched your profile to ${cat}. This item runs true to the collection standard — one size fits your learning path.`;
  }
  if (prompt.includes('Compare')) {
    return `Versus other ${cat} items: this one leads on completion rate and pairs well with bundles. I can add it to your cart now.`;
  }
  return `Locked in. Tap Buy — ${price} — and I'll enroll you instantly. No checkout maze.`;
}

export function GptSalesAssistant({
  productTitle,
  productDescription,
  category,
  priceCents,
  currency,
  onBuy,
  buying,
}: GptSalesAssistantProps) {
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([
    {
      role: 'assistant',
      text: `Hey — I'm your GPT seller. Browsing ${categoryLabel(category)}? "${productTitle}" is trending. Ask me anything or tap Buy.`,
    },
  ]);

  const price = formatStorefrontPrice(priceCents, currency);

  const sendPrompt = useCallback(
    (prompt: string) => {
      setMessages((m) => [
        ...m,
        { role: 'user', text: prompt },
        { role: 'assistant', text: buildReply(prompt, productTitle, category, price) },
      ]);
    },
    [productTitle, category, price],
  );

  return (
    <aside className="lux-store-assistant-shell rounded-2xl p-5 flex flex-col gap-4 h-fit sticky top-24">
      <div className="flex items-center gap-2">
        <span className="lux-brand-gradient lux-brand-gradient-text h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold">
          GPT
        </span>
        <div>
          <p className="text-sm font-semibold text-primary">Sales AI</p>
          <p className="text-[10px] uppercase tracking-wider text-secondary">Conversion-first · not SEO</p>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 py-2 ${msg.role === 'user' ? 'ml-6' : 'mr-4'}`}
            style={{
              background: msg.role === 'user' ? 'var(--color-fill-tertiary)' : 'var(--color-bg-secondary)',
              color: 'var(--color-label-primary)',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => sendPrompt(p)}
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ border: '1px solid var(--color-separator)', color: 'var(--color-label-secondary)' }}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={buying}
        onClick={onBuy}
        className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', boxShadow: '0 4px 16px rgba(0,122,255,0.4)' }}
      >
        {buying ? 'Processing…' : `Buy · ${price}`}
      </button>
      {productDescription && (
        <p className="text-xs text-secondary line-clamp-2">
          {productDescription.replace(/<!--[\s\S]*?-->/g, '').trim()}
        </p>
      )}
    </aside>
  );
}
