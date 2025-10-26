const { colorTokens } = require('./colors');
const { getButtonColors, getStylesForState } = require('./utils');

jest.mock('../../utils', () => ({
  getColorToken: (_, tokenName) => {
    if (tokenName === 'colors.interactive.base.white') return 'white';
    return null;
  }
}));

jest.mock('./colors', () => ({
  colorTokens: {
    primary: {
      normal: {
        text: null,
        background: null,
        border: null
      },
      hover: {
        text: null
      },
      focus: {
        text: null
      },
      active: {
        text: null
      },
      disabled: {
        text: null
      }
    }
  }
}));

describe('Utils', () => {
  beforeEach(() => {
    colorTokens.primary.normal.text = null;
    colorTokens.primary.normal.background = null;
    colorTokens.primary.normal.border = null;
    colorTokens.primary.hover.text = null;
    colorTokens.primary.focus.text = null;
    colorTokens.primary.active.text = null;
    colorTokens.primary.disabled.text = null;
  });

  describe('getButtonColors', () => {
    it('will return button colors', () => {
      colorTokens.primary.normal.text = 'colors.interactive.base.white';
      colorTokens.primary.normal.border = 'colors.interactive.base.white';
      colorTokens.primary.normal.background = 'colors.interactive.base.white';
      colorTokens.primary.hover.text = 'colors.interactive.base.white';
      colorTokens.primary.focus.text = 'colors.interactive.base.white';
      colorTokens.primary.active.text = 'colors.interactive.base.white';
      colorTokens.primary.disabled.text = 'colors.interactive.base.white';
      const result = getButtonColors({}, 'primary');
      expect(result).toMatchSnapshot();
    });
  });

  describe('getStylesForState', () => {
    it('will assign a color value', () => {
      colorTokens.primary.normal.text = 'colors.interactive.base.white';
      const result = getStylesForState({}, 'primary', 'normal').trim();
      expect(result).toMatchSnapshot();
    });

    it('will assign a border value', () => {
      colorTokens.primary.normal.border = 'colors.interactive.base.white';
      const result = getStylesForState({}, 'primary', 'normal').trim();
      expect(result).toMatchSnapshot();
    });

    it('will assign a background value', () => {
      colorTokens.primary.normal.background = 'colors.interactive.base.white';
      const result = getStylesForState({}, 'primary', 'normal').trim();
      expect(result).toMatchSnapshot();
    });

    it('will work with unknown typeStyles', () => {
      const result = getStylesForState({}, 'unknown', 'normal').trim();
      expect(result).toMatchSnapshot();
    });
  });
});
