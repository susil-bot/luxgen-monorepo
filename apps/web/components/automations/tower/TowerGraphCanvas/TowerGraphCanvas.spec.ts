import { render } from '@testing-library/react';

import { TowerGraphCanvas } from './TowerGraphCanvas';
import { towerGraphCanvasFixtures } from './fixture';

describe('TowerGraphCanvas', () => {
  it('is defined', () => {
    expect(TowerGraphCanvas).toBeDefined();
    expect(towerGraphCanvasFixtures.default).toBeDefined();
  });
});
