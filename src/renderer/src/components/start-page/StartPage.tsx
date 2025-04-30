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
  {
    title: '养老',
    subtopics: ['我怎么知道有没有足够资金养老？']
  },
  {
    title: '通用',
    subtopics: ['北京市提供哪些养老服务？', '怎样选择是否延迟退休？', '清华教职工能拿到哪些员工福利？']
  },
  {
    title: '寿险',
    subtopics: ['如何选择寿险？']
  },
  {
    title: '健康险',
    subtopics: ['生病了保险到底能赔多少？','我买了保险，怎么拒赔？']
  },
  {
    title:'人生规划',
    subtopics:['我希望女儿能接受更好的教育，不知道应该让她接受什么培养路线？',
    '应该咬咬牙买房，还是继续租房等房价降下来？',
    '我到底该不该买车呢，买什么车？',
    '我想赚些外快，开一家辅导班或者培训班的创业合适吗？']
  }
];

interface StartPageProps {
  onStart: (isMessageSent: boolean) => void;
}

// 添加模式类型定义
type Mode = 'written' | 'voice';

// 添加 API 配置
interface ApiConfig {
  type: string;
  api_key: string;
}

const apiConfigs: Record<string, ApiConfig> = {
  '养老': {
    type: 'change_api',
    api_key: 'app-NiDDZo2vqgZJKpeRUCqVOQMB'  // 待填写
  },
  '通用': {
    type: 'change_api',
    api_key: 'YOUR_HEALTH_API_KEY'   // 待填写
  },
  '寿险': {
    type: 'change_api',
    api_key: 'app-aQC3IJycLjRTna436I5IKFfB'  // 待填写
  },
  '健康险': {
    type: 'change_api',
    api_key: 'app-weB7ztnoK8sF2xiSFvwMSgzL'    // 待填写
  },
  '人生规划': {
    type: 'change_api',
    api_key: 'app-TDeTJaR7ofjZafE1CKSIFNZj'    // 待填写
  }
};

// 添加外部链接配置
const externalLinks: Record<string, string> = {
  '养老': 'http://skysail.top/chat/ee6y7Vf6YQrvvpYZ',
  '通用': 'http://47.238.246.199/chat/xLwFvATCNJIHppX1',
  '寿险': 'http://47.238.246.199/chat/dPu5OwsSpVWI7Gzd',
  '健康险': 'http://47.238.246.199/chat/LawAvtzrWRuaDdJS',
  '人生规划': 'http://47.238.246.199/chat/Pobg9z5L9fzPmWgN'
};

export function StartPage({ onStart }: StartPageProps): JSX.Element {
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
      }
    } else {
      // 语音模式
      // 首先发送 API 变更请求
      if(topicTitle !== '通用'){
        const apiConfig = apiConfigs[topicTitle];
        if (apiConfig) {
          console.log('Sending API change request:', apiConfig);
          await sendMessage(apiConfig);
        }
      }
      
      // 然后发送问题
      handleSend(text, index);
    }
  };

  return (
    <Box 
      height="100vh" 
      width="100vw" 
      display="flex" 
      alignItems={isMobileView ? "flex-start" : "center"}
      justifyContent="center"
      bg="gray.50"
      p={isMobileView ? "4" : "6"}
      pt={isMobileView ? "8" : "6"}
      overflowY="auto"
    >
      <VStack 
        gap={isMobileView ? 4 : 6} 
        width={isMobileView ? "100%" : "80%"} 
        maxWidth={isMobileView ? "100%" : "800px"}
        h="auto"
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
        
        <Box position="relative" width="100%" maxWidth="600px" mb={showVoiceIndicator && micOn ? "120px" : 0}>
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

        <Box width="100%" maxWidth="600px" bg="white" p={4} borderRadius="lg" shadow="sm">
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
          maxWidth="800px"
          flexWrap="wrap"
          gap={4}
          justifyContent="center"
          mt={2}
        >
          {topics.map((topic, index) => (
            <Box 
              key={index}
              p={3}
              bg="white"
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
              shadow="sm"
              display="flex"
              flexDirection="column"
              width={isMobileView ? "calc(50% - 8px)" : "220px"}
              height="200px"
              overflow="hidden"
            >
              <Text 
                fontSize="lg"
                fontWeight="bold" 
                mb={2}
              >
                {topic.title}
              </Text>
              <VStack 
                align="stretch" 
                gap={1.5}
                overflow="auto"
                flex={1}
                css={{
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#CBD5E0',
                    borderRadius: '4px',
                  },
                }}
              >
                {topic.subtopics.map((subtopic, subIndex) => (
                  <Button
                    key={subIndex}
                    onClick={() => handleTopicClick(subtopic, index, topic.title)}
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