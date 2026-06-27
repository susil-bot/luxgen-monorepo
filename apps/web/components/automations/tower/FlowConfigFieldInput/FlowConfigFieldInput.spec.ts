import { render } from '@testing-library/react';

import { FlowConfigFieldInput } from './FlowConfigFieldInput';
import { flowConfigFieldInputFixtures } from './fixture';

describe('FlowConfigFieldInput', () => {
  it('is defined', () => {
    expect(FlowConfigFieldInput).toBeDefined();
    expect(flowConfigFieldInputFixtures.default).toBeDefined();
  });
});
