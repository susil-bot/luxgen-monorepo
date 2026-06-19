import type { SplitPageLayoutProps } from './SplitPageLayout';

export const splitPageLayoutFixtures = {
  productEdit: {
    variant: 'main-aside',
    header: <p className="text-sm text-secondary">Product header slot</p>,
    main: <p className="text-sm">Main form sections</p>,
    aside: <p className="text-sm">Status · Publishing · Organization</p>,
  } satisfies SplitPageLayoutProps,

  settings: {
    variant: 'nav-main',
    leading: <p className="text-sm">Settings nav</p>,
    main: <p className="text-sm">Settings form</p>,
  } satisfies SplitPageLayoutProps,
};
