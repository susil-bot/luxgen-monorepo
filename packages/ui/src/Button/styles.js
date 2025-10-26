const { default: styled } = require('styled-components');

const {
  getTypographyStyles,
  calculateSpacing,
  getColorToken
} = require('../../utils');

const { hideVisually } = require('../../utils/accessibility');
const { INTERACTIVE, BREAKPOINTS } = require('../../utils/constants');
const { BaseButton } = require('../../utils/base/BaseButton');
const { getButtonColors } = require('./utils');
const { typographyTokens } = require('./typography');

const typeStyleList = [
  'primary-pair',
  'utility',
  'utility-pair-inverted',
  'utility-inverted'
];

const ButtonWrapper = styled(BaseButton).withConfig({
  displayName: 'ButtonWrapper'
})`
  .spinner {
    transform: scale(1.125);
    animation-name: spin;
    animation-duration: 1200ms;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  .spinner path {
    fill: ${({ loadingSpinnerColor }) => loadingSpinnerColor || 'black'};
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  ${({ hasPriceSection }) =>
    hasPriceSection
      ? `
      justify-content: flex-start;
      flex-direction: row;`
      : `
      justify-content: center;
      `}

  ${({ shouldUseFullWidth }) => shouldUseFullWidth && 'width: 100%;'}

display: ${({ isLink, isStaticText, isInline }) =>
    isLink || isStaticText || isInline ? 'inline-flex' : 'flex'};
  position: relative;
  align-items: center;
  z-index: 1;
  border-radius: ${({ cornerRadius, size }) => {
    if (cornerRadius === 'FullyRoundedCorner') return '50px';
    if (cornerRadius === 'RoundedCorner')
      return size === 'small' ? '2px' : '4px';
    return '0px';
  }};

  padding: ${({ isInline, hasPriceSection, size, isIconButton }) => {
    if (!hasPriceSection) {
      if (size === 'small' && !!isInline === false)
        return isIconButton ? '0' : `0 12px`;
      return isInline || isIconButton === true
        ? `${calculateSpacing(2)}`
        : `0 ${calculateSpacing(2)}`;
    }
    return '';
  }};
  min-width: ${({ isInline, size, isIconButton }) => {
    if (size === 'small' && !!isInline === false)
      return isIconButton ? '32px' : calculateSpacing(5);
    return isInline || isIconButton ? 'auto' : calculateSpacing(5);
  }};
  height: ${({ isInline, size, isIconButton }) => {
    if (size === 'small' && !!isInline === false)
      return isIconButton ? '32px' : '32px';
    return isInline || isIconButton ? 'auto' : calculateSpacing(6);
  }};

  min-height: ${({ isInline, isIconButton }) =>
    isInline || isIconButton ? 'auto' : '0'};

  &.button--utility + &.button--utility {
    margin-top: ${calculateSpacing(2)};
  }

  &.button__icon--chevron-down .button-icon {
    transform: rotate(90deg);
  }

  &.button__icon--chevron-up .button-icon {
    transform: rotate(270deg);
  }

  @media (min-width: ${BREAKPOINTS.md}) {
    min-width: ${({ isInline, size, isIconButton }) => {
      if (size === 'small' && !!isInline === false)
        return isIconButton ? calculateSpacing(4) : calculateSpacing(10);
      return isInline || isIconButton ? 'auto' : calculateSpacing(20);
    }};
  }

  transition-property: color, background, border;
  transition-duration: ${INTERACTIVE.timingButtonDefault};
  transition-timing-function: ease-in;

  &:hover {
    outline: none;
    text-decoration: none;
  }

  &:focus {
    outline: none;
    text-decoration: none;
  }

  &:focus-visible {
    outline: 3px solid #0066cc;
    outline-offset: 3px;
    text-decoration: none;
  }

  &:active {
    outline: none;

    && {
      border-color: ${({ typeStyle }) => {
        if (typeStyle === 'primary' || typeStyle === 'utility-pair')
          return `rgba(255, 255, 255, 0.2);`;
        else if (typeStyleList.includes(typeStyle))
          return `rgba(0, 0, 0, 0.2);`;
        return null;
      }};
    }
  }

  &:active::before {
    position: absolute;
    z-index: -1;
    background: ${({ typeStyle, isIconButton }) => {
      if (!isIconButton) {
        if (typeStyle === 'primary' || typeStyle === 'utility-pair')
          return `rgba(255, 255, 255, 0.2);`;
        else if (typeStyleList.includes(typeStyle))
          return `rgba(0, 0, 0, 0.2);`;
      }
      return null;
    }};
    width: 100%;
    height: 100%;
    content: '';
  }

  &:active {
    outline: none;
    ${({ typeStyle }) => {
      if (typeStyle === 'secondary' || typeStyle === 'inverted-text')
        return `filter: brightness(80%);`;
      else if (typeStyle === 'utility-pair-secondary') return `opacity: .8`;
      return null;
    }};
  }

  ${({ isSpecial }) =>
    isSpecial &&
    `
    margin-top: ${calculateSpacing(2)};`}

  ${({ theme, typeStyle, isInverted, isSpecial }) =>
    getButtonColors(theme, typeStyle, isInverted, isSpecial)}

  ${({ theme, typeStyle }) =>
    getTypographyStyles(theme, typographyTokens[typeStyle])}
`;

const ButtonLabel = styled.span.withConfig({ displayName: 'ButtonLabel' })`
  font-variant-ligatures: none;
  ${({ hasMultipleLines }) =>
    hasMultipleLines &&
    ` text-overflow: ellipsis;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        &{
        padding: 4px 8px 0px;
        }
    `}
  ${({ hasPriceSection }) =>
    hasPriceSection
      ? `
        padding: ${calculateSpacing(2)} ${calculateSpacing(2.5)};
        flex-basis: 75%;
      `
      : `padding: ${calculateSpacing(1)} 0;`}
  ${({ isIconButton }) => {
    return isIconButton ? hideVisually() : '';
  }}
`;

const ButtonIconWrapper = styled.div.withConfig({
  displayName: 'ButtonIconWrapper'
})`
  padding-right: ${({ iconPosition, isIconButton }) => {
    return iconPosition === 'before' && !isIconButton
      ? calculateSpacing(1)
      : '0';
  }};
  padding-left: ${({ iconPosition, isIconButton }) => {
    return iconPosition === 'after' && !isIconButton
      ? calculateSpacing(1)
      : '0';
  }};
`;

const ButtonCountWrapper = styled.div.withConfig({
  displayName: 'ButtonCountWrapper'
})`
  margin-right: ${calculateSpacing(1.5)};
  border: 1px solid;
  border-radius: 50%;
  background: ${getColorToken('colors.interactive.base.white')};
  padding: ${calculateSpacing(0.5)};
  width: 24px;
  height: 24px;
  line-height: 1.33em;
  color: ${getColorToken('colors.interactive.base.brand-primary')};
  font-size: 12px;
`;

const ButtonIcon = styled.span.withConfig({ displayName: 'ButtonIcon' })`
  display: block;
  width: ${({ size, isinline }) => {
    if (size === 'small' && !!isinline === false) return '24px';
    return '32px';
  }};
  height: ${({ size, isinline }) => {
    if (size === 'small' && !!isinline === false) return '24px';
    return '32px';
  }};
`;

const ButtonPriceWrapper = styled.div.withConfig({
  displayName: 'ButtonPriceWrapper'
})`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: ${({ size }) =>
    size === 'default'
      ? `${calculateSpacing(2)} ${calculateSpacing(2.5)}`
      : `${calculateSpacing(1)} ${calculateSpacing(2.5)}`};
  width: 50%;
  height: 100%;
  white-space: nowrap;

  &.button-price {
    background: ${getColorToken('colors.interactive.base.white')};
    color: ${getColorToken('colors.interactive.base.brand-primary')};
  }
`;

const ButtonPriceLabel = styled.span.withConfig({
  displayName: 'ButtonPriceLabel'
})`
  font-variant-ligatures: none;
  padding: ${calculateSpacing(1)} 0;

  > :first-child {
    color: ${getColorToken('colors.interactive.base.dark')};
  }
`;

module.exports = {
  ButtonWrapper,
  ButtonLabel,
  ButtonIconWrapper,
  ButtonIcon,
  ButtonPriceWrapper,
  ButtonCountWrapper,
  ButtonPriceLabel
};
