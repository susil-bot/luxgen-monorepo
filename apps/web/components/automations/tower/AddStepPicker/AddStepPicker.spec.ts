import { render } from '@testing-library/react';

import { AddStepPicker } from './AddStepPicker';
import { addStepPickerFixtures } from './fixture';

describe('AddStepPicker', () => {
  it('is defined', () => {
    expect(AddStepPicker).toBeDefined();
    expect(addStepPickerFixtures.default).toBeDefined();
  });
});
