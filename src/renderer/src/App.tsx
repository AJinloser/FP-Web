// import { StrictMode } from 'react';
import {
  Box, Flex, ChakraProvider, defaultSystem, Button,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
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
import { wsService } from '@/services/websocket-service';
// eslint-disable-next-line import/no-extraneous-dependencies, import/newline-after-import
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { StartPage } from './components/start-page/StartPage';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { isMobile } from '@/utils/device-utils';

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
  const { aiState, setAiState } = useAiState();
  const { currentModel } = useLive2DModel();
  const { isLoading } = useLive2DConfig();
  const [showStartPage, setShowStartPage] = useState(true);
  const shouldResetState = useRef(false);
  const [showLive2D, setShowLive2D] = useState(true);
  const controls = useAnimation();
  const panRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);
  const [isMobileView, setIsMobileView] = useState(isMobile());

  const isProcessing = aiState === 'thinking-speaking' || aiState === 'listening' || isLoading;

  useEffect(() => {
    if (shouldResetState.current && aiState === 'idle') {
      setAiState('thinking-speaking');
      shouldResetState.current = false;
    }
  }, [aiState, setAiState]);

  const toggleMode = () => {
    setViewMode(viewMode === 'live2d' ? 'chat' : 'live2d');
  };

  const isChatMode = viewMode === 'chat';

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 添加滑动处理函数
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50; // 触发切换的阈值
    const deltaY = info.offset.y;
    
    if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        // 下滑，显示 Live2D
        setShowLive2D(true);
        controls.start({ height: "40vh" });
      } else {
        // 上滑，隐藏 Live2D
        setShowLive2D(false);
        controls.start({ height: "0vh" });
      }
    } else {
      // 如果滑动距离不够，恢复原状
      controls.start({ height: showLive2D ? "40vh" : "0vh" });
    }
  };

  // 将 handleReturnHome 提升到 AppContent 组件
  const handleReturnHome = () => {
    // wsService.disconnect();
    setAiState('idle');  // 重置 AI 状态
    setShowStartPage(true);  // 返回首页
  };

  if (showStartPage) {
    return (
      <StartPage 
        onStart={(isMessageSent) => {
          shouldResetState.current = isMessageSent;
          setShowStartPage(false);
        }} 
      />
    );
  }

  return (
    <>
      <Toaster />
      {mode === 'window' ? (
        <>
          {isElectron && <TitleBar />}
          <Flex {...layoutStyles.appContainer}>
            {/* 只在非移动端显示切换按钮 */}
            {!isMobileView && (
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
                  transform: isProcessing ? 'none' : 'translateY(-2px)',
                  boxShadow: isProcessing ? 'sm' : 'md',
                  bg: isProcessing ? 'gray.100' : 'gray.50',
                }}
                borderRadius="xl"
                boxShadow="sm"
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: 'sm',
                  bg: 'gray.100',
                }}
                disabled={isProcessing}
                opacity={isProcessing ? 0.6 : 1}
                cursor={isProcessing ? 'not-allowed' : 'pointer'}
                title={isProcessing ? '正在处理中，请稍候...' : ''}
              >
                {isChatMode ? '切换到 Live2D 模式' : '切换到聊天模式'}
              </Button>
            )}

            {isMobileView ? (
              <Flex direction="column" h="100vh" overflow="hidden">
                {/* Live2D 部分，使用 motion.div 实现动画 */}
                <motion.div
                  animate={controls}
                  initial={{ height: "40vh" }}
                  transition={{ type: "spring", damping: 20 }}
                  style={{ overflow: 'hidden' }}
                >
                  <Box height="40vh">
                    <Canvas />
                  </Box>
                </motion.div>

                {/* 可滑动的聊天面板 */}
                <motion.div
                  ref={panRef}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  style={{ 
                    flex: 1,
                    overflow: 'hidden',
                    touchAction: 'pan-y'
                  }}
                >
                  <Box 
                    {...layoutStyles.mobileLayout.chatPanel}
                    height={showLive2D ? "calc(60vh - 56px)" : "calc(100vh - 56px)"}
                    transition="height 0.3s ease"
                  >
                    {/* 顶部按钮和提示区域 */}
                    <Box 
                      {...layoutStyles.mobileLayout.headerButtons}
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        top="2"
                        left="50%"
                        transform="translateX(-50%)"
                        width="32px"
                        height="4px"
                        borderRadius="full"
                        bg="gray.300"
                        opacity={0.8}
                      />
                      <HeaderButtons 
                        onSettingsOpen={onSettingsOpen}
                        onNewHistory={createNewHistory}
                        onReturnHome={handleReturnHome}
                      />
                    </Box>
                    <ChatHistoryPanel />
                  </Box>
                </motion.div>

                {/* Footer 部分 */}
                <Box {...layoutStyles.mobileLayout.footer}>
                  <Footer
                    isCollapsed={false}
                    onToggle={() => {}}
                  />
                </Box>

                {/* 设置面板 */}
                {settingsOpen && (
                  <SettingUI
                    open={settingsOpen}
                    onClose={onSettingsClose}
                    onToggle={() => {}}
                  />
                )}
              </Flex>
            ) : (
              // 桌面端布局保持不变
              <>
                {viewMode === 'live2d' ? (
                  <>
                    <Box
                      {...layoutStyles.sidebar}
                      {...(!showSidebar && { width: '24px' })}
                    >
                      <Sidebar
                        isCollapsed={!showSidebar}
                        onToggle={() => setShowSidebar(!showSidebar)}
                        onReturnHome={handleReturnHome}
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
                        onReturnHome={handleReturnHome}
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
              </>
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
