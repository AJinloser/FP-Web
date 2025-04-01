const isElectron = window.api !== undefined;
export const settingStyles = {
  settingUI: {
    container: {
      width: '100%',
      height: '100%',
      p: 4,
      gap: 4,
      position: 'relative',
      overflowY: 'auto',
      bg: 'white',
      css: {
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          bg: 'gray.100',
          borderRadius: 'full',
        },
        '&::-webkit-scrollbar-thumb': {
          bg: 'gray.300',
          borderRadius: 'full',
        },
      },
    },
    header: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },
    title: {
      ml: 4,
      fontSize: 'lg',
      fontWeight: 'bold',
    },
    tabs: {
      root: {
        width: '100%',
        variant: 'plain' as const,
        colorPalette: 'gray',
      },
      content: {},
      trigger: {
        color: 'gray.500',
        _selected: {
          color: 'gray.800',
          borderBottom: '2px solid',
          borderColor: 'blue.500',
        },
        _hover: {
          color: 'gray.800',
        },
      },
      list: {
        display: 'flex',
        justifyContent: 'flex-start',
        width: '100%',
        borderBottom: '1px solid',
        borderColor: 'gray.200',
        mb: 4,
        pl: 0,
      },
    },
    footer: {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 2,
      mt: 'auto',
      pt: 4,
      borderTop: '1px solid',
      borderColor: 'gray.200',
    },
    drawerContent: {
      bg: 'white',
      maxWidth: '440px',
      height: isElectron ? 'calc(100vh - 30px)' : '100vh',
      borderLeft: '1px solid',
      borderColor: 'gray.200',
      position: 'fixed',
      zIndex: 1000,
      boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.05)',
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      position: 'relative',
      px: 6,
      py: 4,
    },
    drawerTitle: {
      color: 'gray.800',
      fontSize: 'lg',
      fontWeight: 'semibold',
    },
    closeButton: {
      position: 'absolute',
      right: 1,
      top: 1,
      color: 'gray.600',
      _hover: {
        color: 'gray.800',
      },
    },
    footerButton: {
      minW: '100px',
      _hover: {
        transform: 'translateY(-1px)',
        boxShadow: 'sm',
      },
    },
  },
  general: {
    container: {
      align: 'stretch',
      gap: 6,
      p: 4,
      bg: 'white',
    },
    field: {
      label: {
        color: 'gray.700',
      },
    },
    select: {
      root: {
        colorPalette: 'gray',
        bg: 'gray.50',
      },
      trigger: {
        bg: 'gray.50',
        borderColor: 'gray.200',
        color: 'gray.800',
        _hover: {
          bg: 'gray.100',
        },
      },
    },
    input: {
      bg: 'gray.50',
      borderColor: 'gray.200',
      color: 'gray.800',
    },
    buttonGroup: {
      gap: 4,
      width: '100%',
    },
    button: {
      width: '50%',
      variant: 'outline' as const,
      bg: 'transparent',
      color: 'gray.800',
      borderColor: 'gray.200',
      _hover: {
        bg: 'gray.50',
      },
    },
    fieldLabel: {
      fontSize: '14px',
      color: 'gray.600',
    },
  },
  common: {
    field: {
      orientation: 'horizontal' as const,
    },
    fieldLabel: {
      fontSize: 'sm',
      color: 'gray.700',
    },
    switch: {
      size: 'md' as const,
      colorPalette: 'blue' as const,
      variant: 'solid' as const,
    },
    numberInput: {
      root: {
        pattern: '[0-9]*\\.?[0-9]*',
        inputMode: 'decimal' as const,
      },
      input: {
        bg: 'gray.50',
        borderColor: 'gray.200',
        _hover: {
          borderColor: 'gray.300',
        },
        _focus: {
          borderColor: 'blue.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
        },
      },
    },
    container: {
      gap: 8,
      maxW: 'sm',
      css: { '--field-label-width': '120px' },
    },
    input: {
      bg: 'gray.50',
      borderColor: 'gray.200',
      _hover: {
        borderColor: 'gray.300',
      },
      _focus: {
        borderColor: 'blue.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
      },
    },
  },
  live2d: {
    container: {
      gap: 8,
      maxW: 'sm',
      css: { '--field-label-width': '120px' },
    },
    emotionMap: {
      title: {
        fontWeight: 'bold',
        mb: 4,
      },
      entry: {
        mb: 2,
      },
      button: {
        colorPalette: 'blue',
        mt: 2,
      },
      deleteButton: {
        colorPalette: 'red',
      },
    },
  },
};
