import { render } from '@testing-library/react';

import { TowerShell } from './TowerShell';
import { towerShellFixtures } from './fixture';

describe('TowerShell', () => {
  it('is defined', () => {
    expect(TowerShell).toBeDefined();
    expect(towerShellFixtures.default).toBeDefined();
  });
});
