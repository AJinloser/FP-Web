/* eslint-disable react/require-default-props */
import { Box, Button, Select, Portal, createListCollection, useSelectContext, IconButton, HStack } from '@chakra-ui/react';
import {
  FiSettings, FiClock, FiPlus, FiChevronLeft, FiUsers, FiHome, FiList, FiCheck
} from 'react-icons/fi';
import { memo, useMemo } from 'react';
import { sidebarStyles } from './sidebar-styles';
import SettingUI from './setting/setting-ui';
import ChatHistoryPanel from './chat-history-panel';
import BottomTab from './bottom-tab';
import HistoryDrawer from './history-drawer';
import { useSidebar } from '@/hooks/sidebar/use-sidebar';
import GroupDrawer from './group-drawer';
import { wsService } from '@/services/websocket-service';
import { useSelection } from '@/context/selection-context';

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

// 添加自定义 SelectTrigger 组件
const SelectTrigger = () => {
  const select = useSelectContext();
  return (
    <IconButton
      {...sidebarStyles.sidebar.headerButton}  // 使用与其他按钮相同的样式
      aria-label="Select parameter"
      {...select.getTriggerProps()}
    >
      <FiList />
    </IconButton>
  );
};

export const HeaderButtons = memo(({ onSettingsOpen, onNewHistory, onReturnHome }: HeaderButtonsProps) => {
  const { options, currentSelection, setCurrentSelection } = useSelection();
  
  const collection = useMemo(() => createListCollection({
    items: options.map(option => ({
      label: option,
      value: option,
    })),
  }), [options]);

  return (
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

      <Select.Root 
        collection={collection}
        positioning={{ sameWidth: false }}
        value={currentSelection ? [currentSelection] : []}
        onValueChange={(e) => setCurrentSelection(e.value[0])}
      >
        <Select.Control>
          <SelectTrigger />
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content minW="32">
              {collection.items.map((item) => (
                <Select.Item 
                  key={item.value} 
                  item={item}
                  {...sidebarStyles.sidebar.selectItem}  // 添加到 sidebar-styles.tsx
                >
                  <HStack justify="space-between" width="100%">
                    <span>{item.label}</span>
                    {currentSelection === item.value && (
                      <FiCheck />
                    )}
                  </HStack>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </Box>
  );
});

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
