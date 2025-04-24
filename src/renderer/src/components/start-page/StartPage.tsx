import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Input,
  VStack,
  Grid,
  Text,
  Button,
  HStack,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { useWebSocket } from '@/context/websocket-context';
import { useChatHistory } from '@/context/chat-history-context';
import { useAiState } from '@/context/ai-state-context';
import { useVAD } from '@/context/vad-context';
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
    title: '理财',
    subtopics: ['何时能够实现财富自由？', '如何为子女教育做准备？']
  },
  {
    title: '健康',
    subtopics: ['健康险保单哪个好？', '医疗开支谁来支付？', '买了保单会不会拒赔？']
  },
  {
    title: '养老',
    subtopics: ['到底有没有足够资金养老？', '购买商业年金到底有没有用？', '该不该开设个人养老金账户？']
  },
  {
    title: '理想',
    subtopics: ['多种目标如何实现？']
  }
];

interface StartPageProps {
  onStart: (isMessageSent: boolean) => void;
}

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
        
        <Box position="relative" width="100%" mb={showVoiceIndicator && micOn ? "120px" : 0}>
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

        <Flex 
          width="100%"
          flexWrap="wrap"
          gap={isMobileView ? "3" : "4"}
          justifyContent="center"
        >
          {topics.map((topic, index) => (
            <Box 
              key={index}
              p={4}
              bg="white"
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
              shadow="sm"
              display="flex"
              flexDirection="column"
              flex={isMobileView ? "1 1 calc(50% - 8px)" : "1 1 300px"}
              minW={isMobileView ? "calc(50% - 8px)" : "280px"}
              maxW={isMobileView ? "none" : "350px"}
            >
              <Text 
                fontSize={isMobileView ? "lg" : "xl"} 
                fontWeight="bold" 
                mb={3}
                flex="0 0 auto"
              >
                {topic.title}
              </Text>
              <VStack 
                align="stretch" 
                gap={2}
                flex="1"
              >
                {topic.subtopics.map((subtopic, subIndex) => (
                  <Button
                    key={subIndex}
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={() => handleSend(subtopic, index)}
                    size="md"
                    py={2}
                    height="auto"
                    whiteSpace="normal"
                    textAlign="left"
                    fontSize={isMobileView ? "sm" : "md"}
                    px={3}
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