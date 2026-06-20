import Link from 'next/link';
import { useRouter } from 'next/router';

const LINKS = [
  { href: '/store/product', label: 'Shop' },
  { href: '/store/collections', label: 'Collections' },
  { href: '/store/bundles', label: 'Bundles' },
] as const;

export function StoreNav() {
  const router = useRouter();
  const path = router.pathname;

  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      {LINKS.map(({ href, label }) => {
        const active = path === href || path.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className="text-sm px-4 py-2 rounded-full transition-all"
            style={
              active
                ? {
                    background: 'linear-gradient(135deg, rgba(0,122,255,0.2), rgba(175,82,222,0.15))',
                    border: '1px solid rgba(0,122,255,0.35)',
                    color: 'var(--color-label-primary)',
                    fontWeight: 600,
                  }
                : {
                    color: 'var(--color-label-secondary)',
                    border: '1px solid transparent',
                  }
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
