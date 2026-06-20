import { render } from '@testing-library/react';

import { TowerStepRail } from './TowerStepRail';
import { towerStepRailFixtures } from './fixture';

describe('TowerStepRail', () => {
  it('is defined', () => {
    expect(TowerStepRail).toBeDefined();
    expect(towerStepRailFixtures.default).toBeDefined();
  });
});
