const classnames = require('classnames');
const PropTypes = require('prop-types');
const React = require('react');
const { componentTracking } = require('../../helpers/analytics');
// // @TODO: add this  TRACKING_COMPONENT to the project
// const {
//   TrackComponentChannel
// } = require('../../../Tracking/event-registry/track-component');

const { snowplowClickHandler } = require('./utils');
const Loader = require('../icons/standard/Loader');

const {
  ButtonWrapper,
  ButtonLabel,
  ButtonIconWrapper,
  ButtonIcon,
  ButtonCountWrapper,
  ButtonPriceLabel,
  ButtonPriceWrapper
} = require('./styles');

const layoutMapping = {
  'primary-filled': 'primary',
  'primary-outlined': 'primary-pair',
  'primary-text': 'utility-pair-secondary',
  'utility-filled': 'utility',
  'utility-outlined': 'utility-pair',
  'utility-text': 'secondary',
  'inverted-filled': 'utility-inverted',
  'inverted-outlined': 'utility-pair-inverted',
  'inverted-text': 'inverted-text'
};

const getUpdatedButtonProps = (isDisabled, shouldShowLoadingState, label) => {
  if (!isDisabled && shouldShowLoadingState) {
    return { showLoader: false, buttonLabel: label };
  }
  return { showLoader: true, buttonLabel: null };
};

const layoutStyle = (buttonStyle, typesStyle) => {
  if (typesStyle) {
    const typeStyleArr = typesStyle.split('-');
    const temp =
      typeStyleArr[typeStyleArr.length - 1] === 'inverted' &&
      typesStyle === 'utility-inverted'
        ? `${typeStyleArr[typeStyleArr.length - 1]}-${buttonStyle}`
        : `${typesStyle}-${buttonStyle}`;
    if (layoutMapping[temp]) return layoutMapping[temp];
    return typesStyle;
  }
  return typesStyle;
};

// eslint-disable-next-line complexity
const Button = ({
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  size = 'default',
  btnStyle = 'filled',
  ButtonIcon: Icon,
  className,
  componentId = undefined,
  cornerRadius = 'NoCornerRadius',
  countValue,
  dataAttrs,
  hasEnableIcon = false,
  form,
  isIconButton = false,
  hasLabelCount = false,
  href,
  hasMultipleLines,
  iconPosition = 'after',
  id,
  inputKind = 'button',
  isDisabled,
  shouldShowLoadingState,
  isInline,
  isLinkDisabled,
  isSpecial = false,
  hasPriceSection = false,
  label,
  onClickHandler,
  onKeyDownHandler,
  priceLabel,
  rel,
  role,
  shouldEnableBundleComponentAnalytics,
  shouldEnableClickTracking = true,
  shouldUseFullWidth = false,
  subject = 'button',
  tabIndex,
  target,
  title,
  loadingSpinnerColor,
  trackingNamespace,
  isInverted = false,
  variations = {
    typeStyle: 'primary'
  },
  variationName
}) => {
  React.useEffect(() => {
    window.Tracking.TRACK_COMPONENT.broadcast(TrackComponentChannel.RENDER, {
      name: 'Button',
      variation: variationName
    });
  }, [variationName]);

  const { showLoader, buttonLabel } = getUpdatedButtonProps(
    isDisabled,
    shouldShowLoadingState,
    label
  );

  const shouldRenderLoaderOnButton = shouldShowLoadingState && showLoader;

  const tags = {
    button: 'button',
    link: 'a',
    reset: 'button',
    submit: 'button',
    text: 'div'
  };
  const TagName = tags[inputKind];
  const anchorProps =
    inputKind === 'link'
      ? {
          'aria-disabled': isLinkDisabled,
          href,
          rel,
          target
        }
      : {};

  const isLink = inputKind === 'link';
  const isStaticText = inputKind === 'text';
  const hasIcon = Boolean(ButtonIcon);
  const { typeStyle } = variations;
  let analyticsDataAttribute = {};
  if (shouldEnableBundleComponentAnalytics) {
    analyticsDataAttribute = componentTracking.addDataSectionTitleAttribute(
      shouldEnableBundleComponentAnalytics,
      trackingNamespace || label
    );
  }

  const renderLabelHTML = () => {
    return shouldShowLoadingState ? buttonLabel : label;
  };

  const buttonIcon = (
    <ButtonIconWrapper
      className="button__icon-container"
      iconPosition={iconPosition}
      isIconButton={isIconButton}
      size={size}
    >
      <ButtonIcon
        className="button-icon"
        as={Icon}
        size={size}
        isinline={isInline}
      />
    </ButtonIconWrapper>
  );

  const price = (
    <ButtonPriceWrapper
      as="span"
      className={classnames('button', 'button-price')}
    >
      <ButtonPriceLabel
        className="button__label"
        dangerouslySetInnerHTML={{ __html: priceLabel }}
      />
    </ButtonPriceWrapper>
  );

  const Count = (
    <ButtonCountWrapper
      as="span"
      className={classnames('button', 'button-count')}
      dangerouslySetInnerHTML={{ __html: countValue }}
    />
  );

  if (ariaDescribedby) {
    anchorProps['aria-describedby'] = ariaDescribedby;
  }

  if (ariaLabelledby) {
    anchorProps['aria-labelledby'] = ariaLabelledby;
  }

  if (ariaLabel) {
    anchorProps['aria-label'] = ariaLabel;
  }

  const handleOnClick = (event, subject, componentId) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClickHandler && onClickHandler(event);
    if (shouldEnableClickTracking) {
      snowplowClickHandler(isLink, label, href, subject, 'click', componentId);
    }
  };

  return (
    <ButtonWrapper
      {...analyticsDataAttribute}
      {...anchorProps}
      {...dataAttrs}
      as={TagName}
      btnStyle={btnStyle}
      hasEnableIcon={hasEnableIcon}
      loadingSpinnerColor={loadingSpinnerColor}
      className={classnames(
        'button',
        {
          [`button--${layoutStyle(btnStyle, typeStyle)}`]: layoutStyle(
            btnStyle,
            typeStyle
          )
        },
        className
      )}
      cornerRadius={cornerRadius}
      isInline={isInline}
      isIconButton={isIconButton}
      hasIcon={hasIcon}
      isStaticText={isStaticText}
      isLink={isLink}
      typeStyle={layoutStyle(btnStyle, typeStyle)}
      data-event-click={JSON.stringify({
        element: 'Button',
        outgoingURL: href
      })}
      data-testid="Button"
      aria-disabled={isDisabled}
      form={form}
      size={size}
      hasPriceSection={hasPriceSection}
      id={id}
      onClick={(event) => handleOnClick(event, subject, componentId)}
      onKeyDown={onKeyDownHandler}
      role={role}
      shouldUseFullWidth={shouldUseFullWidth}
      tabIndex={tabIndex}
      title={title}
      type={inputKind !== 'link' && inputKind !== 'text' ? inputKind : ''}
      isInverted={isInverted}
      isSpecial={isSpecial}
    >
      {shouldRenderLoaderOnButton && <Loader className="spinner" />}
      {hasLabelCount && Count}
      {(isIconButton || hasEnableIcon) &&
        Icon &&
        iconPosition === 'before' &&
        buttonIcon}
      <ButtonLabel
        className="button__label"
        dangerouslySetInnerHTML={{ __html: renderLabelHTML() }}
        typeStyle={typeStyle}
        isIconButton={isIconButton}
        hasPriceSection={hasPriceSection}
        hasMultipleLines={hasMultipleLines}
      />
      {hasPriceSection && price}
      {(isIconButton || hasEnableIcon) &&
        Icon &&
        iconPosition === 'after' &&
        buttonIcon}
    </ButtonWrapper>
  );
};

Button.propTypes = {
  ariaDescribedby: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaLabelledby: PropTypes.string,
  btnStyle: PropTypes.oneOf(['filled', 'outlined', 'text']),
  ButtonIcon: PropTypes.func,
  className: PropTypes.string,
  componentId: PropTypes.string,
  cornerRadius: PropTypes.oneOf([
    'NoCornerRadius',
    'RoundedCorner',
    'FullyRoundedCorner'
  ]),
  countValue: PropTypes.number,
  dataAttrs: PropTypes.object,
  form: PropTypes.string,
  hasEnableIcon: PropTypes.bool,
  hasLabelCount: PropTypes.bool,
  hasMultipleLines: PropTypes.bool,
  hasPriceSection: PropTypes.bool,
  href: PropTypes.string,
  iconPosition: PropTypes.oneOf(['before', 'after']),
  id: PropTypes.string,
  inputKind: PropTypes.oneOf(['button', 'link', 'reset', 'submit', 'text']),
  isDisabled: PropTypes.bool,
  isIconButton: PropTypes.bool,
  isInline: PropTypes.bool,
  isInverted: PropTypes.bool,
  isLinkDisabled: PropTypes.bool,
  isSpecial: PropTypes.bool,
  label: PropTypes.string.isRequired,
  loadingSpinnerColor: PropTypes.string,
  onClickHandler: PropTypes.func,
  onKeyDownHandler: PropTypes.func,
  priceLabel: PropTypes.string,
  rel: PropTypes.string,
  role: PropTypes.string,
  shouldEnableBundleComponentAnalytics: PropTypes.bool,
  shouldEnableClickTracking: PropTypes.bool,
  shouldShowLoadingState: PropTypes.bool,
  shouldUseFullWidth: PropTypes.bool,
  size: PropTypes.string,
  subject: PropTypes.string,
  tabIndex: PropTypes.number,
  target: PropTypes.string,
  title: PropTypes.string,
  trackingNamespace: PropTypes.string,
  variationName: PropTypes.string,
  variations: PropTypes.shape({
    typeStyle: PropTypes.oneOf(['primary', 'utility', 'utility-inverted'])
  })
};

module.exports = Button;
