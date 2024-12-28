const isElectron = window.api !== undefined
export const layoutStyles = {
  appContainer: {
    width: '100vw',
    height: isElectron ? 'calc(100vh - 30px)' : '100vh',
    bg: 'gray.900',
    color: 'white',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex'
  },
  sidebar: {
    position: 'relative' as const,
    width: '440px',
    height: '100%',
    bg: 'gray.800',
    borderRight: '1px solid',
    borderColor: 'whiteAlpha.200',
    overflow: 'hidden',
    flexShrink: 0,
    transition: 'all 0.2s'
  },
  mainContent: {
    flex: 1,
    height: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    overflow: 'hidden'
  },
  canvas: {
    position: 'relative',
    width: '100%',
    flex: 1,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    willChange: 'transform'
  },
  footer: {
    width: '100%',
    height: '120px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform',
    position: 'relative',
    zIndex: 1
  },
  toggleButton: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: '60px',
    bg: 'whiteAlpha.100',
    _hover: { bg: 'whiteAlpha.200' },
    borderLeftRadius: 0,
    borderRightRadius: 'md',
    zIndex: 10
  },
  canvasHeight: (isFooterCollapsed: boolean) => ({
    height: isFooterCollapsed ? 'calc(100% - 24px)' : 'calc(100% - 120px)'
  }),
  sidebarToggleButton: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: '60px',
    bg: 'gray.800',
    borderLeftRadius: 0,
    borderRightRadius: 'md',
    zIndex: 10
  },
  collapsedFooter: {
    height: '24px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }
}
