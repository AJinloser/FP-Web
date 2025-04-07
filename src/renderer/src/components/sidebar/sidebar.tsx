/* eslint-disable react/require-default-props */
import { Box, Button } from '@chakra-ui/react';
import {
  FiSettings, FiClock, FiPlus, FiChevronLeft, FiUsers, FiHome,
} from 'react-icons/fi';
import { memo } from 'react';
import { sidebarStyles } from './sidebar-styles';
import SettingUI from './setting/setting-ui';
import ChatHistoryPanel from './chat-history-panel';
import BottomTab from './bottom-tab';
import HistoryDrawer from './history-drawer';
import { useSidebar } from '@/hooks/sidebar/use-sidebar';
import GroupDrawer from './group-drawer';
import { wsService } from '@/services/websocket-service';

// Type definitions
interface SidebarProps {
  isCollapsed?: boolean
  onToggle: () => void
  onReturnHome: () => void
}

interface HeaderButtonsProps {
  onSettingsOpen: () => void
  onNewHistory: () => void
  onReturnHome?: () => void
}

// Reusable components
const ToggleButton = memo(({ isCollapsed, onToggle }: {
  isCollapsed: boolean
  onToggle: () => void
}) => (
  <Box
    {...sidebarStyles.sidebar.toggleButton}
    style={{
      transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
    }}
    onClick={onToggle}
  >
    <FiChevronLeft />
  </Box>
));

ToggleButton.displayName = 'ToggleButton';

export const HeaderButtons = memo(({ onSettingsOpen, onNewHistory, onReturnHome }: HeaderButtonsProps) => (
  <Box display="flex" gap={1}>
    <Button {...sidebarStyles.sidebar.headerButton} onClick={onSettingsOpen}>
      <FiSettings />
    </Button>

    <GroupDrawer>
      <Button {...sidebarStyles.sidebar.headerButton}>
        <FiUsers />
      </Button>
    </GroupDrawer>

    <HistoryDrawer>
      <Button {...sidebarStyles.sidebar.headerButton}>
        <FiClock />
      </Button>
    </HistoryDrawer>

    <Button {...sidebarStyles.sidebar.headerButton} onClick={onNewHistory}>
      <FiPlus />
    </Button>

    <Button 
      {...sidebarStyles.sidebar.headerButton} 
      onClick={onReturnHome}
      title="返回首页"
    >
      <FiHome />
    </Button>
  </Box>
));

HeaderButtons.displayName = 'HeaderButtons';

const SidebarContent = memo(({ onSettingsOpen, onNewHistory, onReturnHome }: HeaderButtonsProps) => (
  <Box {...sidebarStyles.sidebar.content}>
    <Box {...sidebarStyles.sidebar.header}>
      <HeaderButtons
        onSettingsOpen={onSettingsOpen}
        onNewHistory={onNewHistory}
        onReturnHome={onReturnHome}
      />
    </Box>
    <ChatHistoryPanel />
    <BottomTab />
  </Box>
));

SidebarContent.displayName = 'SidebarContent';

// Main component
function Sidebar({ isCollapsed = false, onToggle, onReturnHome }: SidebarProps): JSX.Element {
  const {
    settingsOpen,
    onSettingsOpen,
    onSettingsClose,
    createNewHistory,
  } = useSidebar();

  return (
    <Box {...sidebarStyles.sidebar.container(isCollapsed)}>
      <ToggleButton isCollapsed={isCollapsed} onToggle={onToggle} />

      {!isCollapsed && !settingsOpen && (
        <SidebarContent
          onSettingsOpen={onSettingsOpen}
          onNewHistory={createNewHistory}
          onReturnHome={onReturnHome}
        />
      )}

      {!isCollapsed && settingsOpen && (
        <SettingUI
          open={settingsOpen}
          onClose={onSettingsClose}
          onToggle={onToggle}
        />
      )}
    </Box>
  );
}

export default Sidebar;
