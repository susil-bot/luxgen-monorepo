import { render } from '@testing-library/react';

import { TowerStepConnections } from './TowerStepConnections';
import { towerStepConnectionsFixtures } from './fixture';

describe('TowerStepConnections', () => {
  it('is defined', () => {
    expect(TowerStepConnections).toBeDefined();
    expect(towerStepConnectionsFixtures.default).toBeDefined();
  });
});
