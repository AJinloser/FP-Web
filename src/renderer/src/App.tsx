// import { StrictMode } from 'react';
import {
  Box, Flex, ChakraProvider, defaultSystem, Button,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Canvas from './components/canvas/canvas';
import Sidebar from './components/sidebar/sidebar';
import Footer from './components/footer/footer';
import ChatHistoryPanel from './components/sidebar/chat-history-panel';
import { HeaderButtons } from './components/sidebar/sidebar';
import SettingUI from './components/sidebar/setting/setting-ui';
import { useSidebar } from '@/hooks/sidebar/use-sidebar';
import { AiStateProvider, useAiState } from './context/ai-state-context';
import { Live2DConfigProvider, useLive2DConfig } from './context/live2d-config-context';
import { SubtitleProvider } from './context/subtitle-context';
import { BgUrlProvider } from './context/bgurl-context';
import { layoutStyles } from './layout';
import WebSocketHandler from './services/websocket-handler';
import { CameraProvider } from './context/camera-context';
import { ChatHistoryProvider } from './context/chat-history-context';
import { CharacterConfigProvider } from './context/character-config-context';
import { Toaster } from './components/ui/toaster';
import { VADProvider } from './context/vad-context';
import { Live2D } from './components/canvas/live2d';
import TitleBar from './components/electron/title-bar';
import { Live2DModelProvider, useLive2DModel } from './context/live2d-model-context';
import { InputSubtitle } from './components/electron/input-subtitle';
import { ProactiveSpeakProvider } from './context/proactive-speak-context';
import { ScreenCaptureProvider } from './context/screen-capture-context';
import { GroupProvider } from './context/group-context';
// eslint-disable-next-line import/no-extraneous-dependencies, import/newline-after-import
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { StartPage } from './components/start-page/StartPage';

function App(): JSX.Element {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFooterCollapsed, setIsFooterCollapsed] = useState(false);
  const [mode, setMode] = useState('window');
  const [viewMode, setViewMode] = useState('live2d');
  const isElectron = window.api !== undefined;
  
  useEffect(() => {
    if (isElectron) {
      window.electron.ipcRenderer.on('pre-mode-changed', (_event, newMode) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.electron.ipcRenderer.send('renderer-ready-for-mode-change', newMode);
          });
        });
      });
    }
  }, [isElectron]);

  useEffect(() => {
    if (isElectron) {
      window.electron.ipcRenderer.on('mode-changed', (_event, newMode) => {
        setMode(newMode);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.electron.ipcRenderer.send('mode-change-rendered');
          });
        });
      });
    }
  }, [isElectron]);

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ChakraProvider value={defaultSystem}>
      <Live2DModelProvider>
        <CameraProvider>
          <ScreenCaptureProvider>
            <CharacterConfigProvider>
              <ChatHistoryProvider>
                <AiStateProvider>
                  <ProactiveSpeakProvider>
                    <Live2DConfigProvider>
                      <SubtitleProvider>
                        <VADProvider>
                          <BgUrlProvider>
                            <GroupProvider>
                              <WebSocketHandler>
                                <AppContent 
                                  mode={mode}
                                  viewMode={viewMode}
                                  setViewMode={setViewMode}
                                  showSidebar={showSidebar}
                                  setShowSidebar={setShowSidebar}
                                  isFooterCollapsed={isFooterCollapsed}
                                  setIsFooterCollapsed={setIsFooterCollapsed}
                                  isElectron={isElectron}
                                />
                              </WebSocketHandler>
                            </GroupProvider>
                          </BgUrlProvider>
                        </VADProvider>
                      </SubtitleProvider>
                    </Live2DConfigProvider>
                  </ProactiveSpeakProvider>
                </AiStateProvider>
              </ChatHistoryProvider>
            </CharacterConfigProvider>
          </ScreenCaptureProvider>
        </CameraProvider>
      </Live2DModelProvider>
    </ChakraProvider>
  );
}

// 新增一个内部组件来使用hooks
function AppContent({
  mode,
  viewMode,
  setViewMode,
  showSidebar,
  setShowSidebar,
  isFooterCollapsed,
  setIsFooterCollapsed,
  isElectron
}: {
  mode: string;
  viewMode: string;
  setViewMode: (mode: string) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  isFooterCollapsed: boolean;
  setIsFooterCollapsed: (collapsed: boolean) => void;
  isElectron: boolean;
}) {
  const { onSettingsOpen, onSettingsClose, createNewHistory, settingsOpen } = useSidebar();
  const { aiState } = useAiState();
  const { currentModel } = useLive2DModel();
  const { isLoading } = useLive2DConfig();
  const [showStartPage, setShowStartPage] = useState(true);

  const isProcessing = aiState === 'thinking-speaking' || aiState === 'listening' || isLoading;

  const toggleMode = () => {
    setViewMode(viewMode === 'live2d' ? 'chat' : 'live2d');
  };

  const isChatMode = viewMode === 'chat';

  if (showStartPage) {
    return <StartPage onStart={() => setShowStartPage(false)} />;
  }

  return (
    <>
      <Toaster />
      {mode === 'window' ? (
        <>
          {isElectron && <TitleBar />}
          <Flex {...layoutStyles.appContainer}>
            <Button
              colorScheme="gray"
              size="sm"
              onClick={toggleMode}
              position="fixed"
              top={4}
              right={4}
              zIndex={1000}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              bg="white"
              color="gray.700"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'md',
                bg: 'gray.50',
              }}
              borderRadius="xl"
              boxShadow="sm"
              _active={{
                transform: 'translateY(0)',
                boxShadow: 'sm',
                bg: 'gray.100',
              }}
            >
              {isChatMode ? '切换到 Live2D 模式' : '切换到聊天模式'}
            </Button>
            {viewMode === 'live2d' ? (
              <>
                <Box
                  {...layoutStyles.sidebar}
                  {...(!showSidebar && { width: '24px' })}
                >
                  <Sidebar
                    isCollapsed={!showSidebar}
                    onToggle={() => setShowSidebar(!showSidebar)}
                  />
                </Box>
                <Box {...layoutStyles.mainContent}>
                  <Canvas />
                  <Box
                    {...layoutStyles.footer}
                    {...(isFooterCollapsed && layoutStyles.collapsedFooter)}
                  >
                    <Footer
                      isCollapsed={isFooterCollapsed}
                      onToggle={() => setIsFooterCollapsed(!isFooterCollapsed)}
                    />
                  </Box>
                </Box>
              </>
            ) : (
              <Box {...layoutStyles.mainContent}>
                <Box p="4">
                  <HeaderButtons 
                    onSettingsOpen={onSettingsOpen}
                    onNewHistory={createNewHistory}
                  />
                </Box>
                <Box flex="1" overflow="auto">
                  <ChatHistoryPanel />
                </Box>
                <Box
                  {...layoutStyles.footer}
                  {...(isFooterCollapsed && layoutStyles.collapsedFooter)}
                >
                  <Footer
                    isCollapsed={isFooterCollapsed}
                    onToggle={() => setIsFooterCollapsed(!isFooterCollapsed)}
                  />
                </Box>
                {settingsOpen && (
                  <SettingUI
                    open={settingsOpen}
                    onClose={onSettingsClose}
                    onToggle={() => {}}
                  />
                )}
              </Box>
            )}
          </Flex>
        </>
      ) : (
        <>
          <Live2D isPet={mode === 'pet'} />
          {mode === 'pet' && (
            <InputSubtitle isPet={mode === 'pet'} />
          )}
        </>
      )}
    </>
  );
}

export default App;
