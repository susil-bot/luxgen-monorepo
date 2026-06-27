import { render } from '@testing-library/react';

import { FlowConnector } from './FlowConnector';
import { flowConnectorFixtures } from './fixture';

describe('FlowConnector', () => {
  it('is defined', () => {
    expect(FlowConnector).toBeDefined();
    expect(flowConnectorFixtures.default).toBeDefined();
  });
});
