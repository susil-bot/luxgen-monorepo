const { getColorToken } = require('../../utils');

const { colorTokens } = require('./colors');
const {
  nonURLClickEvent
} = require('../../helpers/analytics/snowplow-tracking');
const { trackNavigationClick } = require('../../helpers/tracking');

const getStylesForState = (
  theme,
  typeStyle,
  buttonState,
  isInverted,
  isSpecial
) => {
  const typeStyleColors = colorTokens[typeStyle];
  const stateColors = typeStyleColors && typeStyleColors[buttonState];

  let textColor = getColorToken(theme, stateColors?.text);
  let backgroundColor = getColorToken(theme, stateColors?.background);
  let borderColor = getColorToken(theme, stateColors?.border);

  if (isInverted) {
    textColor = getColorToken(theme, 'colors.background.black');
    backgroundColor = getColorToken(theme, 'colors.background.white');
    borderColor = getColorToken(theme, 'colors.background.white');
  }
  if (isSpecial) {
    textColor = getColorToken(theme, 'colors.background.white');
    backgroundColor = getColorToken(
      theme,
      'colors.consumption.lead.special.background'
    );
    borderColor = getColorToken(theme, 'colors.background.white');
  }
  return `
      ${textColor ? `color: ${textColor};` : ''}
      ${
        borderColor
          ? `
        border-color: ${borderColor};
        border-width: 2px;
        border-style: solid;
      `
          : ''
      }
      ${isSpecial ? `border-width: 4px;` : ''}
      background-color: ${backgroundColor || 'transparent'};
    `;
};

const getButtonColors = (theme, typeStyle, isInverted, isSpecial) => {
  return `
  ${getStylesForState(theme, typeStyle, 'normal', isInverted, isSpecial)}

    &:hover {
      ${getStylesForState(theme, typeStyle, 'hover')}
    }

    &:focus {
      ${getStylesForState(theme, typeStyle, 'focus')}
    }

    &:active {
      ${getStylesForState(theme, typeStyle, 'active', isInverted, isSpecial)}
    }

    &:disabled,
    &[aria-disabled='true'],
    &&[aria-disabled='true']:focus,
    &&[aria-disabled='true']:active { 
      cursor: default;
      pointer-events: none;
      ${getStylesForState(theme, typeStyle, 'disabled')}
    }
  `;
};

const snowplowClickHandler = (
  isLink,
  label,
  href,
  subject = 'button',
  type = 'click',
  componentId = null
) => {
  if (!isLink && label) {
    nonURLClickEvent(label, href);
  }
  if (isLink) {
    // snowplow tracking
    trackNavigationClick(href, label, subject, type, componentId);
  }
};

module.exports = {
  getButtonColors,
  getStylesForState,
  snowplowClickHandler
};
