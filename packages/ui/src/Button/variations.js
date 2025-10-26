const { asVariation } = require('../../helpers/variations');

const Button = require('./Button');

Button.Primary = asVariation(Button, 'Primary', {
  typeStyle: 'primary'
});
Button.Secondary = asVariation(Button, 'Secondary', {
  typeStyle: 'secondary'
});
Button.Utility = asVariation(Button, 'Utility', {
  typeStyle: 'utility'
});
Button.UtilityInverted = asVariation(Button, 'Utility', {
  typeStyle: 'utility-inverted'
});
Button.UtilityPairInverted = asVariation(Button, 'UtilityPairInverted', {
  typeStyle: 'utility-pair-inverted'
});
Button.InvertedText = asVariation(Button, 'InvertedText', {
  typeStyle: 'inverted-text'
});
Button.UtilityPairSecondary = asVariation(Button, 'UtilityPairSecondary', {
  typeStyle: 'utility-pair-secondary'
});

module.exports = Button;
