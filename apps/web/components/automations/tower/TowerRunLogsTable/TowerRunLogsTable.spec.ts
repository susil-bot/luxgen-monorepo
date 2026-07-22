import { render } from '@testing-library/react';

import { TowerRunLogsTable } from './TowerRunLogsTable';
import { towerRunLogsTableFixtures } from './fixture';

describe('TowerRunLogsTable', () => {
  it('is defined', () => {
    expect(TowerRunLogsTable).toBeDefined();
    expect(towerRunLogsTableFixtures.default).toBeDefined();
  });
});
