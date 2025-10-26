const colorTokens = {
    primary: {
      normal: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.brand-primary',
        border: 'colors.interactive.base.brand-primary'
      },
      hover: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.brand-secondary',
        border: 'colors.interactive.base.brand-secondary'
      },
      focus: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.brand-primary',
        border: 'colors.interactive.base.brand-primary'
      },
      active: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.brand-secondary',
        border: 'colors.interactive.base.brand-secondary'
      },
      disabled: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.light',
        border: 'colors.interactive.base.light'
      }
    },
    'primary-pair': {
      normal: {
        text: 'colors.interactive.base.brand-primary',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.brand-primary'
      },
      hover: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.brand-primary',
        border: 'colors.interactive.base.brand-primary'
      },
      focus: {
        text: 'colors.interactive.base.brand-primary',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.brand-primary'
      },
      active: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.brand-primary',
        border: 'colors.interactive.base.brand-primary'
      },
      disabled: {
        text: 'colors.interactive.base.light',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.light'
      }
    },
    secondary: {
      normal: {
        text: 'colors.interactive.base.black'
      },
      hover: {
        text: 'colors.interactive.base.brand-primary'
      },
      focus: {
        text: 'colors.interactive.base.black'
      },
      active: {
        text: 'colors.interactive.base.brand-primary'
      },
      disabled: {
        text: 'colors.interactive.base.light'
      }
    },
    utility: {
      normal: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.black',
        border: 'colors.interactive.base.black'
      },
      hover: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.brand-primary',
        border: 'colors.interactive.base.brand-primary'
      },
      focus: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.black',
        border: 'colors.interactive.base.black'
      },
      active: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.brand-primary',
        border: 'colors.interactive.base.brand-primary'
      },
      disabled: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.light',
        border: 'colors.interactive.base.light'
      }
    },
    'utility-inverted': {
      normal: {
        text: 'colors.interactive.base.black',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.white'
      },
      hover: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.brand-primary',
        border: 'colors.interactive.base.brand-primary'
      },
      focus: {
        text: 'colors.interactive.base.black',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.white'
      },
      active: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.brand-primary',
        border: 'colors.interactive.base.brand-primary'
      },
      disabled: {
        text: 'colors.interactive.base.light',
        background: 'colors.interactive.base.dark',
        border: 'colors.interactive.base.dark'
      }
    },
    'utility-pair': {
      normal: {
        text: 'colors.interactive.base.black',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.black'
      },
      hover: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.black',
        border: 'colors.interactive.base.black'
      },
      focus: {
        text: 'colors.interactive.base.black',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.black'
      },
      active: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.black',
        border: 'colors.interactive.base.black'
      },
      disabled: {
        text: 'colors.interactive.base.light',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.light'
      }
    },
    'utility-pair-inverted': {
      normal: {
        text: 'colors.interactive.base.white',
        background: null,
        border: 'colors.interactive.base.white'
      },
      hover: {
        text: 'colors.interactive.base.black',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.white'
      },
      focus: {
        text: 'colors.interactive.base.white',
        background: 'colors.interactive.base.black',
        border: 'colors.interactive.base.white'
      },
      active: {
        text: 'colors.interactive.base.black',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.white'
      },
      disabled: {
        text: 'colors.interactive.base.dark',
        background: null,
        border: 'colors.interactive.base.dark'
      }
    },
    'inverted-text': {
      normal: {
        text: 'colors.interactive.base.white'
      },
      hover: {
        text: 'colors.interactive.base.brand-primary'
      },
      focus: {
        text: 'colors.interactive.base.white'
      },
      active: {
        text: 'colors.interactive.base.brand-primary'
      },
      disabled: {
        text: 'colors.interactive.base.dark'
      }
    },
    'utility-pair-secondary': {
      normal: {
        text: 'colors.interactive.base.brand-primary',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.white'
      },
      hover: {
        text: 'colors.interactive.base.brand-secondary',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.white'
      },
      focus: {
        text: 'colors.interactive.base.brand-primary',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.white'
      },
      active: {
        text: 'colors.interactive.base.brand-secondary',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.white'
      },
      disabled: {
        text: 'colors.interactive.base.light',
        background: 'colors.interactive.base.white',
        border: 'colors.interactive.base.white'
      }
    }
  };
  
  module.exports = { colorTokens };
  