import { buttonFixtures } from './fixture.ts';
import { ButtonTranslations } from './translations';

describe('Button', () => {
  it('exports default fixtures with tenant theme', () => {
    expect(buttonFixtures.default.tenantTheme).toBeDefined();
    expect(buttonFixtures.default.tenantTheme.colors).toBeDefined();
  });

  it('exports English translations', () => {
    expect(ButtonTranslations.en.title).toBe('Button');
  });
});
