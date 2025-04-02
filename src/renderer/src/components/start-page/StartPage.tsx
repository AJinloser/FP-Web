import React, { useState } from 'react';
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
      alignItems="center" 
      justifyContent="center"
      bg="gray.50"
    >
      <VStack gap={8} width="80%" maxWidth="800px">
        <Input
          size="lg"
          placeholder="输入你想说的话..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          borderRadius="full"
          p={6}
          bg="white"
          border="1px"
          borderColor="gray.200"
        />
        
        <Grid templateColumns="repeat(3, 1fr)" gap={6} width="100%">
          {topics.map((topic, index) => (
            <Box 
              key={index}
              p={4}
              bg="white"
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
            >
              <Text fontSize="xl" fontWeight="bold" mb={4}>
                {topic.title}
              </Text>
              <VStack align="stretch" gap={2}>
                {topic.subtopics.map((subtopic, subIndex) => (
                  <Button
                    key={subIndex}
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={() => handleSend(subtopic)}
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