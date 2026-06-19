import { SplitPageLayout } from '../SplitPageLayout';

export interface OrderDetailLayoutProps {
  header: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
}

/** @deprecated Use SplitPageLayout directly. Thin wrapper for order detail. */
export function OrderDetailLayout({ header, main, sidebar }: OrderDetailLayoutProps) {
  return (
    <SplitPageLayout variant="main-aside" header={header} main={main} aside={sidebar} />
  );
}
