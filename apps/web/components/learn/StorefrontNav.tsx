import Link from 'next/link';
import { useRouter } from 'next/router';

const LINKS = [
  { href: '/learn', label: 'Home' },
  { href: '/learn/products', label: 'Products' },
  { href: '/learn/collections', label: 'Collections' },
  { href: '/learn/bundles', label: 'Bundles' },
  { href: '/learn/subscriptions', label: 'Subscriptions' },
] as const;

export function StorefrontNav() {
  const router = useRouter();
  const path = router.pathname;

  return (
    <nav className="flex flex-wrap gap-1 mb-8 border-b border-separator pb-3">
      {LINKS.map(({ href, label }) => {
        const active = path === href || (href !== '/learn' && path.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
              active ? 'font-semibold text-primary' : 'text-secondary hover:text-primary'
            }`}
            style={active ? { backgroundColor: 'var(--color-fill-tertiary)' } : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
