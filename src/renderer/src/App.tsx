// import { StrictMode } from 'react';
import {
  Box, Flex, ChakraProvider, defaultSystem, Button, HStack,
} from '@chakra-ui/react';
import { useState, useEffect, useRef, useCallback } from 'react';
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
import { useWebSocket } from '@/context/websocket-context';
import { FloatingWindow } from './components/FloatingWindow';
import { SelectionProvider } from './context/selection-context';
import { EndPage } from './components/end-page/EndPage';

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
                              <SelectionProvider>
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
                              </SelectionProvider>
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
  const { reconnect } = useWebSocket();
  const [specialContent, setSpecialContent] = useState('');
  const [showFloating, setShowFloating] = useState(false);
  const lastAiResponseTime = useRef<number>(0);
  const specialContentRef = useRef('');
  const [showEndPage, setShowEndPage] = useState(false);

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
    // 1. 中断当前对话
    wsService.disconnect();  // 断开当前的 WebSocket 连接
    
    // 2. 重置所有相关状态
    setAiState('idle');  // 重置 AI 状态
    createNewHistory();  // 创建新的对话历史
    
    // 3. 返回首页
    setShowStartPage(true);
    
    // 4. 重新连接 WebSocket，准备新的对话
    setTimeout(() => {
      reconnect();
    }, 100);
  };

  // 监听特殊内容更新事件
  useEffect(() => {
    const handleSpecialContent = (event: CustomEvent) => {
      const { content } = event.detail;
      const currentTime = Date.now();
      
      // 如果窗口已经显示，追加新的特殊内容
      if (showFloating) {
        specialContentRef.current += '\n\n' + content;
        setSpecialContent(specialContentRef.current);
        return;
      }
      
      // 如果窗口未显示，且距离上次显示超过500ms，显示新内容
      if (currentTime - lastAiResponseTime.current > 500) {
        specialContentRef.current = content;
        setSpecialContent(content);
        setShowFloating(true);
        lastAiResponseTime.current = currentTime;
      }
    };

    window.addEventListener('special-content-update', handleSpecialContent as EventListener);
    return () => {
      window.removeEventListener('special-content-update', handleSpecialContent as EventListener);
    };
  }, [showFloating]);

  // 处理关闭浮动窗口
  const handleCloseFloating = useCallback(() => {
    setShowFloating(false);
    // specialContentRef.current = ''; // 清空特殊内容缓存
    // 发送关闭事件
    window.dispatchEvent(new CustomEvent('floating-window-close'));
  }, []);

  // 添加结束聊天处理函数
  const handleEndChat = () => {
    wsService.disconnect(); // 断开 WebSocket 连接
    setShowEndPage(true);
  };

  // 添加重新开始处理函数
  const handleRestart = () => {
    setShowEndPage(false);
    setShowStartPage(true);
    setTimeout(() => {
      reconnect(); // 重新连接 WebSocket
    }, 100);
  };

  if (showStartPage) {
    return (
      <StartPage 
        onStart={(isMessageSent) => {
          shouldResetState.current = isMessageSent;
          setShowStartPage(false);
        }}
        onEnd={() => {
          setShowStartPage(false);
          setShowEndPage(true);
        }}
      />
    );
  }

  if (showEndPage) {
    return (
      <EndPage onRestart={handleRestart} />
    );
  }

  return (
    <>
      <Toaster />
      {/* 全局悬浮窗口 */}
      <FloatingWindow
        content={specialContent}
        visible={showFloating}
        onClose={handleCloseFloating}
      />

      {mode === 'window' ? (
        <>
          {isElectron && <TitleBar />}
          <Flex {...layoutStyles.appContainer}>
            {/* 只在非移动端显示切换按钮 */}
            {!isMobileView && (
              <HStack gap={2} position="fixed" top={4} right={4} zIndex={1000}>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={handleEndChat}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  bg="white"
                  color="red.500"
                  _hover={{
                    transform: isProcessing ? 'none' : 'translateY(-2px)',
                    boxShadow: isProcessing ? 'sm' : 'md',
                    bg: 'red.50',
                  }}
                  borderRadius="xl"
                  boxShadow="sm"
                  _active={{
                    transform: 'translateY(0)',
                    boxShadow: 'sm',
                    bg: 'red.100',
                  }}
                  disabled={isProcessing}
                  opacity={isProcessing ? 0.6 : 1}
                  cursor={isProcessing ? 'not-allowed' : 'pointer'}
                  title={isProcessing ? '正在处理中，请稍候...' : ''}
                >
                  结束聊天
                </Button>
                <Button
                  colorScheme="gray"
                  size="sm"
                  onClick={toggleMode}
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
              </HStack>
            )}

            {isMobileView ? (
              <Flex direction="column" h="100vh" minH="0" overflow="hidden">
                {/* 移动端右上角的结束聊天按钮 */}
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={handleEndChat}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  bg="white"
                  color="red.500"
                  _hover={{
                    transform: isProcessing ? 'none' : 'translateY(-2px)',
                    boxShadow: isProcessing ? 'sm' : 'md',
                    bg: 'red.50',
                  }}
                  borderRadius="xl"
                  boxShadow="sm"
                  _active={{
                    transform: 'translateY(0)',
                    boxShadow: 'sm',
                    bg: 'red.100',
                  }}
                  disabled={isProcessing}
                  opacity={isProcessing ? 0.6 : 1}
                  cursor={isProcessing ? 'not-allowed' : 'pointer'}
                  title={isProcessing ? '正在处理中，请稍候...' : ''}
                  position="fixed"
                  top={4}
                  right={4}
                  zIndex={1000}
                >
                  结束聊天
                </Button>
                {/* Live2D 部分，使用 motion.div 实现动画 */}
                <motion.div
                  animate={controls}
                  initial={{ height: "40vh" }}
                  transition={{ type: "spring", damping: 20 }}
                  style={{ overflow: 'hidden', flex: 'none' }}
                >
                  <Box height="100%">
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
                    minHeight: 0,
                    overflow: 'hidden',
                    touchAction: 'pan-y'
                  }}
                >
                  <Box
                    {...layoutStyles.mobileLayout.chatPanel}
                    height="100%"
                    transition="height 0.3s ease"
                  >
                    {/* 顶部按钮和提示区域 */}
                    <Box
                      flex="none"
                      {...layoutStyles.mobileLayout.headerButtons}
                    >
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
                <Box flex="none" {...layoutStyles.mobileLayout.footer}>
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
