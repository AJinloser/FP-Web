import { css } from '@emotion/react';

const isElectron = window.api !== undefined;

const commonStyles = {
  scrollbar: {
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
  panel: {
    border: '1px solid',
    borderColor: 'gray.200',
    borderRadius: 'xl',
    bg: 'white',
    boxShadow: 'sm',
  },
  title: {
    fontSize: 'lg',
    fontWeight: 'semibold',
    color: 'gray.800',
    mb: 4,
  },
};

export const sidebarStyles = {
  sidebar: {
    container: (isCollapsed: boolean) => ({
      position: 'absolute' as const,
      left: 0,
      top: 0,
      height: '100%',
      width: '440px',
      bg: 'white',
      transform: isCollapsed
        ? 'translateX(calc(-100% + 24px))'
        : 'translateX(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
      overflow: isCollapsed ? 'visible' : 'hidden',
      pb: '4',
      boxShadow: 'sm',
      borderRight: '1px solid',
      borderColor: 'gray.200',
      _hover: {
        borderColor: 'gray.300',
        boxShadow: 'md',
      },
      borderTopRightRadius: 'xl',
      borderBottomRightRadius: 'xl',
    }),
    toggleButton: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: '24px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'gray.600',
      _hover: { 
        color: 'gray.800',
        bg: 'gray.50',
        borderLeft: '1px solid',
        borderColor: 'gray.200'
      },
      bg: 'transparent',
      transition: 'all 0.2s',
      zIndex: 999,
    },
    content: {
      flex: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
      overflow: 'hidden',
    },
    header: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 2,
    },
    headerButton: {
      variant: 'ghost' as const,
      color: 'gray.600',
      bg: 'transparent',
      _hover: {
        bg: 'gray.50',
        color: 'gray.800'
      },
      _active: {
        bg: 'gray.100'
      },
    },
  },

  chatHistoryPanel: {
    container: {
      flex: 1,
      overflow: 'hidden',
      px: 4,
      display: 'flex',
      flexDirection: 'column',
      borderTopRadius: 'xl',
    },
    title: commonStyles.title,
    messageList: {
      ...commonStyles.panel,
      p: 4,
      width: '95%',
      flex: 1,
      overflowY: 'auto',
      css: {
        ...commonStyles.scrollbar,
        scrollPaddingBottom: '1rem',
      },
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      bg: 'white',
      transition: 'all 0.2s ease-in-out',
      _hover: {
        boxShadow: 'md',
      },
    },
  },

  systemLogPanel: {
    container: {
      width: '100%',
      overflow: 'hidden',
      px: 4,
      minH: '200px',
      marginTop: 'auto',
      bg: 'white',
    },
    title: commonStyles.title,
    logList: {
      ...commonStyles.panel,
      p: 4,
      height: '200px',
      overflowY: 'auto',
      fontFamily: 'mono',
      color: 'gray.800',
      bg: 'gray.50',
      borderColor: 'gray.200',
    },
    entry: {
      p: 2,
      borderRadius: 'md',
      color: 'gray.700',
      _hover: {
        bg: 'gray.100',
      },
    },
  },

  chatBubble: {
    container: {
      display: 'flex',
      position: 'relative',
      _hover: {
        bg: 'gray.50',
      },
      py: 1,
      px: 2,
      borderRadius: 'md',
    },
    message: {
      maxW: '90%',
      bg: 'transparent',
      p: 2,
    },
    text: {
      fontSize: 'xs',
      color: 'gray.800',
    },
    dot: {
      position: 'absolute',
      w: '2',
      h: '2',
      borderRadius: 'full',
      bg: 'white',
      top: '2',
    },
  },

  historyDrawer: {
    listContainer: {
      flex: 1,
      overflowY: 'auto',
      px: 4,
      py: 2,
      css: commonStyles.scrollbar,
    },
    historyItem: {
      mb: 4,
      p: 3,
      borderRadius: 'md',
      bg: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
      _hover: {
        bg: 'gray.50',
      },
    },
    historyItemSelected: {
      bg: 'gray.100',
      borderLeft: '3px solid',
      borderColor: 'blue.500',
    },
    historyHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 2,
    },
    timestamp: {
      fontSize: 'sm',
      color: 'gray.600',
      fontFamily: 'mono',
    },
    deleteButton: {
      variant: 'ghost' as const,
      colorScheme: 'red' as const,
      size: 'sm' as const,
      color: 'red.500',
      opacity: 0.8,
      _hover: {
        opacity: 1,
        bg: 'red.50',
      },
    },
    messagePreview: {
      fontSize: 'sm',
      color: 'gray.800',
      noOfLines: 2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    drawer: {
      content: {
        background: 'white',
        maxWidth: '440px',
        marginTop: isElectron ? '30px' : '0',
        height: isElectron ? 'calc(100vh - 30px)' : '100vh',
      },
      title: {
        color: 'gray.800',
      },
      closeButton: {
        color: 'gray.600',
        _hover: {
          color: 'gray.800',
        },
      },
      actionButton: {
        color: 'gray.800',
        borderColor: 'gray.300',
        bg: 'white',
        _hover: {
          bg: 'gray.50',
        },
      },
    },
  },

  cameraPanel: {
    container: {
      width: '97%',
      overflow: 'hidden',
      px: 4,
      minH: '240px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 4,
    },
    title: commonStyles.title,
    videoContainer: {
      ...commonStyles.panel,
      width: '100%',
      height: '240px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      transition: 'all 0.2s',
    },
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      transform: 'scaleX(-1)',
      borderRadius: '8px',
      display: 'block',
    } as const,
  },

  screenPanel: {
    container: {
      width: '97%',
      overflow: 'hidden',
      px: 4,
      minH: '240px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 4,
    },
    title: commonStyles.title,
    screenContainer: {
      ...commonStyles.panel,
      width: '100%',
      height: '240px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      transition: 'all 0.2s',
    },
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      borderRadius: '8px',
      display: 'block',
    } as const,
  },

  bottomTab: {
    container: {
      width: '97%',
      px: 4,
      position: 'relative' as const,
      zIndex: 0,
      borderBottomRadius: 'xl',
    },
    tabs: {
      width: '100%',
      bg: 'gray.50',
      borderRadius: 'xl',
      p: '1',
      transition: 'all 0.2s ease-in-out',
      _hover: {
        boxShadow: 'sm',
      },
    },
    list: {
      borderBottom: 'none',
      gap: '2',
    },
    trigger: {
      color: 'gray.600',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      px: 3,
      py: 2,
      borderRadius: 'md',
      _hover: {
        color: 'gray.800',
        bg: 'gray.100',
      },
      _selected: {
        color: 'gray.800',
        bg: 'white',
        boxShadow: 'sm',
      },
    },
  },

  groupDrawer: {
    section: {
      mb: 6,
    },
    sectionTitle: {
      fontSize: 'lg',
      fontWeight: 'semibold',
      color: 'gray.800',
      mb: 3,
    },
    inviteBox: {
      display: 'flex',
      gap: 2,
    },
    input: {
      bg: 'gray.50',
      border: '1px solid',
      borderColor: 'gray.200',
      color: 'gray.800',
      _placeholder: {
        color: 'gray.400',
      },
    },
    memberList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    memberItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 2,
      borderRadius: 'md',
      bg: 'gray.50',
    },
    memberText: {
      color: 'gray.800',
      fontSize: 'sm',
    },
    removeButton: {
      size: 'sm',
      color: 'red.300',
      bg: 'transparent',
      _hover: {
        bg: 'gray.50',
      },
    },
    button: {
      color: 'gray.800',
      bg: 'gray.50',
      _hover: {
        bg: 'gray.100',
      },
    },
    clipboardButton: {
      color: 'gray.600',
      bg: 'transparent',
      _hover: {
        bg: 'gray.50',
      },
      size: 'sm',
    },
  },
};

export const chatPanelStyles = css`
  .cs-message-list {
    background: white !important;
    padding: var(--chakra-space-4);
  }
  
  .cs-message__content {
    background-color: var(--chakra-colors-gray-50) !important;
    border-radius: var(--chakra-radii-xl) !important;
    color: var(--chakra-colors-gray-800) !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  }

  .cs-message--outgoing .cs-message__content {
    background-color: var(--chakra-colors-blue-50) !important;
  }

  .cs-chat-container {
    background: white !important;
    border: 1px solid var(--chakra-colors-gray-200);
    border-radius: var(--chakra-radii-xl);
  }

  .cs-message__sender {
    color: var(--chakra-colors-gray-700) !important;
  }

  .cs-avatar {
    background-color: var(--chakra-colors-blue-50) !important;
    color: var(--chakra-colors-blue-600) !important;
  }

  .cs-message--outgoing .cs-avatar {
    background-color: var(--chakra-colors-green-50) !important;
    color: var(--chakra-colors-green-600) !important;
  }

  .cs-message-input {
    background-color: white !important;
    border-top: 1px solid var(--chakra-colors-gray-200) !important;
  }

  .cs-message-input__content-editor {
    background-color: var(--chakra-colors-gray-50) !important;
    color: var(--chakra-colors-gray-800) !important;
  }

  .cs-button {
    color: var(--chakra-colors-gray-600) !important;
    &:hover {
      color: var(--chakra-colors-gray-800) !important;
      background-color: var(--chakra-colors-gray-50) !important;
    }
  }
`;
