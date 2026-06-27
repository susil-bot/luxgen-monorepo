import { useEffect, useState } from 'react';

/** True after the first client paint — use to avoid SSR/client HTML mismatches (localStorage, Apollo cache). */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
