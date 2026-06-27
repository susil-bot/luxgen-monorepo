import { SplitPageLayout, type SplitPageLayoutProps } from '../SplitPageLayout';

export interface ProductEditLayoutProps {
  header: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
}

/** @deprecated Use SplitPageLayout directly. Thin wrapper for product edit. */
export function ProductEditLayout({ header, main, sidebar }: ProductEditLayoutProps) {
  return <SplitPageLayout variant="main-aside" header={header} main={main} aside={sidebar} />;
}

export type { SplitPageLayoutProps };
