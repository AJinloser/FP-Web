import React, { useState, useEffect } from 'react';
import {
  Box,
  Input,
  VStack,
  Grid,
  Text,
  Button,
} from '@chakra-ui/react';
import { useWebSocket } from '@/context/websocket-context';
import { useChatHistory } from '@/context/chat-history-context';
import { useAiState } from '@/context/ai-state-context';

interface TopicItem {
  title: string;
  subtopics: string[];
}

const topics: TopicItem[] = [
  {
    title: '健康',
    subtopics: ['健康险保单哪个好？', '医疗开支谁来支付？', '买了保单会不会拒赔？']
  },
  {
    title: '理想',
    subtopics: ['多种目标如何实现？']
  },
  {
    title: '养老',
    subtopics: ['到底有没有足够资金养老？', '购买商业年金到底有没有用？', '该不该开设个人养老金账户？']
  },
  {
    title: '理财',
    subtopics: ['何时能够实现财富自由？', '如何为子女教育做准备？']
  }
];

interface StartPageProps {
  onStart: () => void;
}

export function StartPage({ onStart }: StartPageProps): JSX.Element {
  const [inputText, setInputText] = useState('');
  const { sendMessage } = useWebSocket();
  const { appendHumanMessage } = useChatHistory();
  const { setAiState } = useAiState();

  // 添加移动端检测逻辑
  const isMobile = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const aspectRatio = viewportWidth / viewportHeight;
    return aspectRatio < 1.2;
  };

  const [isMobileView, setIsMobileView] = useState(isMobile());

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    appendHumanMessage(text.trim());
    sendMessage({
      type: 'text-input',
      text: text.trim()
    });
    setAiState('thinking-speaking');
    onStart();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputText.trim()) {
      handleSend(inputText);
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
    >
      <VStack 
        gap={isMobileView ? 4 : 6} 
        width={isMobileView ? "100%" : "80%"} 
        maxWidth={isMobileView ? "100%" : "800px"}
        h={isMobileView ? "auto" : "auto"}
      >
        <Input
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
          mb={isMobileView ? 2 : 0}
        />
        
        <Grid 
          templateColumns={isMobileView ? "1fr" : "repeat(3, 1fr)"}
          gap={isMobileView ? 3 : 6} 
          width="100%"
        >
          {topics.map((topic, index) => (
            <Box 
              key={index}
              p={isMobileView ? 4 : 4}
              bg="white"
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
              shadow={isMobileView ? "sm" : "none"}
              minH={isMobileView ? "140px" : "auto"}
              display="flex"
              flexDirection="column"
            >
              <Text 
                fontSize={isMobileView ? "xl" : "xl"} 
                fontWeight="bold" 
                mb={isMobileView ? 3 : 4}
                flex={isMobileView ? "0 0 auto" : "auto"}
              >
                {topic.title}
              </Text>
              <VStack 
                align="stretch" 
                gap={isMobileView ? 2 : 2}
                flex={1}
                justify="space-between"
              >
                {topic.subtopics.map((subtopic, subIndex) => (
                  <Button
                    key={subIndex}
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={() => handleSend(subtopic)}
                    size={isMobileView ? "md" : "md"}
                    py={isMobileView ? 3 : 3}
                    height={isMobileView ? "auto" : "auto"}
                    whiteSpace="normal"
                    textAlign="left"
                    fontSize={isMobileView ? "sm" : "md"}
                    px={4}
                  >
                    {subtopic}
                  </Button>
                ))}
              </VStack>
            </Box>
          ))}
        </Grid>
      </VStack>
    </Box>
  );
} 