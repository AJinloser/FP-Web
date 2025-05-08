import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  Button,
  HStack,
  IconButton,
  Flex,
  Switch,
} from '@chakra-ui/react';
import { useWebSocket } from '@/context/websocket-context';
import { useChatHistory } from '@/context/chat-history-context';
import { useAiState } from '@/context/ai-state-context';
import { useMicToggle } from '@/hooks/utils/use-mic-toggle';
import { BsMicFill, BsMicMuteFill, BsSend } from 'react-icons/bs';
import { isMobile } from '@/utils/device-utils';
import { VoiceIndicator } from '@/components/voice/VoiceIndicator';
import { useSelection } from '@/context/selection-context';

interface TopicItem {
  title: string;
  subtopics: string[];
}

const topics: TopicItem[] = [
  { title: '健康险', subtopics: ['如果生病了，商业保险究竟能赔多少？','社保、商保、自付的比例是多少？'] },
  { title: '寿险', subtopics: ['如何选择寿险？'] },
  { title: '养老', subtopics: ['怎么知道我有没有足够资金养老？'] },
  { title: '规划', subtopics: ['我希望孩子能接受更好的教育，应该选择什么培养路线？','应该咬咬牙买房，还是继续租房等房价降下来？','我应该怎么做理财？'] }
];

interface StartPageProps {
  onStart: (isMessageSent: boolean) => void;
  onEnd: () => void;
}

// 添加模式类型定义
type Mode = 'written' | 'voice';

// 添加 API 配置
interface ApiConfig {
  type: string;
  api_key: string;
}

const apiConfigs: Record<string, ApiConfig> = {
  '健康险': {
    type: 'change_api',
    api_key: 'app-8xJXXK0N8GG5ApHfxv6c3j5K'    // 待填写
  },
  '寿险': {
    type: 'change_api',
    api_key: 'app-oDow3kYGcixiILaCfe2uSoKg'  // 待填写
  },
  '养老': {
    type: 'change_api',
    api_key: 'app-1U6qv0OJCiYli8sDnkCFU3Jn'  // 待填写
  },
  '规划': {
    type: 'change_api',
    api_key: 'app-TDeTJaR7ofjZafE1CKSIFNZj'    // 待填写
  }
};

// 添加外部链接配置
const externalLinks: Record<string, string> = {
  '健康险': 'http://47.238.246.199/chat/7NgG1RQS16F6yorT',
  '寿险': 'http://47.238.246.199/chat/ENBbpwdASe61CcLu',
  '养老': 'http://47.238.246.199/chat/Hht7OZHrigAWKgbR',
  '规划': 'http://47.238.246.199/chat/Pobg9z5L9fzPmWgN'
};

export function StartPage({ onStart, onEnd }: StartPageProps): JSX.Element {
  const [inputText, setInputText] = useState('');
  const { sendMessage } = useWebSocket();
  const { appendHumanMessage } = useChatHistory();
  const { setAiState } = useAiState();
  const isMessageSent = useRef(false);
  const { handleMicToggle, micOn } = useMicToggle();
  const { baseUrl } = useWebSocket();
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [showVoiceIndicator, setShowVoiceIndicator] = useState(false);
  const { options, setCurrentSelection } = useSelection();
  const [mode, setMode] = useState<Mode>('voice');
  const [currentTopic, setCurrentTopic] = useState<string>('健康险');

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 修改 websocket 消息处理
  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      const message = event.detail;
      if (message.type === 'user-input-transcription' && message.text) {
        setInputText(prevText => {
          // 如果当前已有文本，则在末尾添加空格再追加新文本
          const prefix = prevText.trim() ? `${prevText.trim()} ` : '';
          return `${prefix}${message.text}`;
        });
      }
    };

    window.addEventListener('websocket-message', handleMessage as EventListener);
    return () => {
      window.removeEventListener('websocket-message', handleMessage as EventListener);
    };
  }, []);

  const handleSend = (text: string, index: number) => {
    if (!text.trim()) return;
    
    if (mode === 'written') {
      // 书面模式下，跳转到对应链接
      const link = externalLinks[currentTopic];
      if (link) {
        console.log('Redirecting to:', link);
        window.open(link, '_blank');
        onEnd();
      }
    } else {
      // 语音模式下的原有逻辑
      setCurrentSelection(options[index]);
      isMessageSent.current = true;
      setAiState('thinking-speaking');
      appendHumanMessage(text.trim());
      sendMessage({
        type: 'text-input',
        text: text.trim(),
        selection: options[index]
      });
      
      onStart(isMessageSent.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText.trim()) {
      handleSend(inputText, 0);
    }
  };

  const handleMicClick = () => {
    setShowVoiceIndicator(!showVoiceIndicator && !micOn);
    handleMicToggle();
  };

  const handleModeChange = (value: Mode) => {
    console.log('Mode changed to:', value);
    setMode(value);
  };

  const handleTopicClick = async (text: string, index: number, topicTitle: string) => {
    if (mode === 'written') {
      // 跳转到外部链接
      const link = externalLinks[topicTitle];
      if (link) {
        console.log('Redirecting to:', link);
        window.open(link, '_blank');
        // 书面模式下，跳转到结束页面
        onEnd();
      }
    } else {
      // 语音模式
      // 首先发送 API 变更请求
      const apiConfig = apiConfigs[topicTitle];
      if (apiConfig) {
        console.log('Sending API change request:', apiConfig);
        await sendMessage(apiConfig);
      }
      
      // 然后发送问题
      handleSend(text, index);
    }
  };

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      bg="gray.50"
      p={isMobileView ? "4" : "6"}
      style={{ overflowY: 'auto', height: '100vh' }}
    >
      <VStack
        gap={isMobileView ? 4 : 6}
        width="100%"
        maxWidth="900px"
        align="center"
      >
        <Box 
          width={isMobileView ? "240px" : "360px"} 
          mb={isMobileView ? 4 : 6}
        >
          <img
            src={`${baseUrl}/logo/logo-site.png`}
            alt="Site Logo"
            style={{ 
              width: '100%',
              height: 'auto',
              maxWidth: '100%'
            }}
          />
        </Box>
        
        <Box
          position="relative"
          width="100%"
          maxWidth="900px"
          mb={showVoiceIndicator && micOn ? "120px" : 0}
        >
          <HStack width="100%">
            <Input
              flex={1}
              size={isMobileView ? "lg" : "lg"}
              placeholder="输入你想说的话..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              borderRadius="full"
              p={isMobileView ? 6 : 6}
              bg="white"
              border="1px"
              borderColor="gray.200"
              fontSize={isMobileView ? "md" : "lg"}
              h={isMobileView ? "56px" : "auto"}
            />
            <IconButton
              aria-label="Toggle microphone"
              bg={micOn ? 'green.500' : 'red.500'}
              color="white"
              size="lg"
              borderRadius="full"
              onClick={handleMicClick}
              _hover={{ opacity: 0.8 }}
            >
              {micOn ? <BsMicFill /> : <BsMicMuteFill />}
            </IconButton>
            <IconButton
              aria-label="Send message"
              bg="blue.500"
              color="white"
              size="lg"
              borderRadius="full"
              onClick={() => handleSend(inputText, 0)}
              disabled={!inputText.trim()}
              _hover={{ opacity: 0.8 }}
            >
              <BsSend />
            </IconButton>
          </HStack>
          
          <VoiceIndicator show={showVoiceIndicator && micOn} position="bottom" />
        </Box>

        <Box width="100%" maxWidth="900px" bg="white" p={4} borderRadius="lg" shadow="sm">
          <HStack justify="space-between" align="center" mb={2}>
            <Switch.Root
              id="mode-switch"
              size="lg"
              colorPalette="blue"
              checked={mode === 'voice'}
              onCheckedChange={(e) => handleModeChange(e.checked ? 'voice' : 'written')}
            >
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Label>
                {mode === 'written' ? '当前：书面模式' : '当前：语音模式'}
              </Switch.Label>
            </Switch.Root>
          </HStack>
          <VStack align="start" gap={1}>
            <Text fontSize="sm" color="gray.500">
              {mode === 'written' 
                ? '书面模式：纯文本聊天形式，便于理论阐述。点击问题可直接跳转到专业咨询页面。' 
                : '语音模式：虚拟人和语音交流，便于交互理解。可通过语音或文字输入进行对话。'}
            </Text>
            <Text fontSize="xs" color="gray.400">
              {mode === 'written'
                ? '提示：在书面模式下，系统会为您提供更详细的文字解答和专业资源链接。'
                : '提示：在语音模式下，虚拟人将通过语音与您进行自然对话，提供更直观的交互体验。'}
            </Text>
          </VStack>
        </Box>

        <Flex
          width="100%"
          maxWidth="900px"
          gap={4}
          justifyContent="center"
          alignItems="stretch"
          direction={isMobileView ? "column" : "row"}
        >
          {topics.map((topic, idx) => (
            <Box
              key={topic.title}
              bg="white"
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
              shadow="sm"
              p={4}
              width={isMobileView ? "100%" : "220px"}
              minWidth={isMobileView ? "100%" : "0"}
              display="flex"
              flexDirection="column"
              flex={1}
              minHeight={0}
              height={isMobileView ? "auto" : "260px"}
              boxSizing="border-box"
            >
              <Button
                variant="ghost"
                width="100%"
                justifyContent="flex-start"
                fontSize="lg"
                fontWeight="bold"
                mb={2}
                cursor="pointer"
                _hover={{ bg: 'blue.50' }}
                _active={{ bg: 'blue.100' }}
                onClick={async () => {
                  const apiConfig = apiConfigs[topic.title];
                  if (apiConfig) {
                    console.log('Sending API change request from title:', apiConfig);
                    await sendMessage(apiConfig);
                    setCurrentTopic(topic.title);
                    window.alert(`已成功切换到${topic.title}模块！`);
                  }
                }}
              >
                {topic.title}
              </Button>
              <VStack
                align="stretch"
                gap={1.5}
                overflow="auto"
                flex={1}
                minHeight={0}
                css={{
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '4px' },
                }}
              >
                {topic.subtopics.map((subtopic, subIndex) => (
                  <Button
                    key={subIndex}
                    onClick={() => handleTopicClick(subtopic, idx, topic.title)}
                    variant="ghost"
                    justifyContent="flex-start"
                    size="sm"
                    py={1}
                    height="auto"
                    whiteSpace="normal"
                    textAlign="left"
                    fontSize="sm"
                  >
                    {subtopic}
                  </Button>
                ))}
              </VStack>
            </Box>
          ))}
        </Flex>
      </VStack>
    </Box>
  );
} 