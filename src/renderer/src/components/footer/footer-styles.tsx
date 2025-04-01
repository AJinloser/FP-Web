import { SystemStyleObject } from '@chakra-ui/react';

interface FooterStyles {
  container: (isCollapsed: boolean) => SystemStyleObject
  toggleButton: SystemStyleObject
  actionButton: {
    borderRadius: string
    width: string
    height: string
    minW: string
    bg: string
    border: string
    borderColor: string
    color: string
    transition: string
    _hover: {
      transform: string
      boxShadow: string
      bg: string
      color: string
      borderColor: string
    }
    _active: {
      transform: string
      boxShadow: string
    }
    '&.active': {
      color: string
      borderColor: string
      bg: string
      _hover: {
        bg: string
        borderColor: string
      }
    }
    '&.inactive': {
      color: string
      borderColor: string
      bg: string
      _hover: {
        bg: string
        borderColor: string
      }
    }
  }
  input: SystemStyleObject
  attachButton: SystemStyleObject
}

interface AIIndicatorStyles {
  container: SystemStyleObject
  text: SystemStyleObject
}

export const footerStyles: {
  footer: FooterStyles
  aiIndicator: AIIndicatorStyles
} = {
  footer: {
    container: (isCollapsed) => ({
      bg: isCollapsed ? 'transparent' : 'white',
      borderTopRadius: isCollapsed ? 'none' : 'xl',
      boxShadow: isCollapsed ? 'none' : '0 -4px 12px rgba(0, 0, 0, 0.05)',
      transform: isCollapsed ? 'translateY(calc(100% - 24px))' : 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      height: '100%',
      position: 'relative',
      overflow: isCollapsed ? 'visible' : 'hidden',
      pb: '4',
    }),
    toggleButton: {
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'gray.500',
      _hover: { color: 'gray.800' },
      bg: 'transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    actionButton: {
      borderRadius: 'xl',
      width: '50px',
      height: '50px',
      minW: '50px',
      bg: 'white',
      border: '1.5px solid',
      borderColor: 'gray.200',
      color: 'gray.600',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: 'md',
        bg: 'gray.50',
        color: 'gray.800',
        borderColor: 'gray.300',
      },
      _active: {
        transform: 'translateY(0)',
        boxShadow: 'sm',
      },
      '&.active': {
        color: 'blue.600',
        borderColor: 'blue.200',
        bg: 'blue.50',
        _hover: {
          bg: 'blue.100',
          borderColor: 'blue.300',
        },
      },
      '&.inactive': {
        color: 'gray.600',
        borderColor: 'gray.200',
        bg: 'gray.50',
        _hover: {
          bg: 'gray.100',
          borderColor: 'gray.300',
        },
      },
    },
    input: {
      bg: 'gray.50',
      border: '1px solid',
      borderColor: 'gray.200',
      borderRadius: 'xl',
      height: '80px',
      fontSize: '18px',
      pl: '12',
      pr: '4',
      color: 'gray.800',
      _placeholder: {
        color: 'gray.400',
      },
      _focus: {
        borderColor: 'blue.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
      },
      resize: 'none',
      minHeight: '80px',
      maxHeight: '80px',
      py: '0',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '28px',
      lineHeight: '1.4',
    },
    attachButton: {
      position: 'absolute',
      left: '1',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'gray.500',
      zIndex: 2,
      _hover: {
        bg: 'transparent',
        color: 'gray.800',
      },
    },
  },
  aiIndicator: {
    container: {
      bg: 'gray.50',
      color: 'gray.800',
      width: '110px',
      height: '30px',
      borderRadius: 'xl',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'sm',
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'gray.200',
    },
    text: {
      fontSize: '12px',
      color: 'gray.800',
    },
  },
};
