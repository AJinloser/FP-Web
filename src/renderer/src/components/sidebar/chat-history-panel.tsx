/* eslint-disable no-nested-ternary */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/require-default-props */
import { Box } from '@chakra-ui/react';
import {
  memo, useEffect, useRef, useCallback,
} from 'react';
import { ChatBubble } from './chat-bubble';
import { sidebarStyles, chatPanelStyles } from './sidebar-styles';
import { Message } from '@/services/websocket-service';
import { MainContainer, ChatContainer, MessageList as ChatMessageList, Message as ChatMessage, Avatar as ChatAvatar } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { useChatHistory } from '@/context/chat-history-context';
import { Global } from '@emotion/react';
import { useConfig } from '@/context/character-config-context';
import { useWebSocket } from '@/context/websocket-context';
import { Markdown } from '@/components/sidebar/markdown';

// Type definitions
interface MessageListProps {
  messages: Message[]
  messageListRef: React.RefObject<HTMLDivElement>
  onMessageUpdate?: (message: Message) => void
}

// Memoized message list component with scroll handling
const MessageList = memo(({ messages, messageListRef }: MessageListProps): JSX.Element => {
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      const { scrollHeight } = messageListRef.current;
      const height = messageListRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;

      messageListRef.current.scrollTo({
        top: maxScrollTop + 100,
        behavior: 'smooth',
      });
    }
  }, [messageListRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <Box {...sidebarStyles.chatHistoryPanel.messageList} ref={messageListRef}>
      {messages.map((message, index) => (
        <Box
          key={`${message.role}-${message.timestamp}-${message.id}`}
          ref={index === messages.length - 1 ? lastMessageRef : null}
        >
          <ChatBubble
            message={message}
          />
        </Box>
      ))}
    </Box>
  );
});

MessageList.displayName = 'MessageList';

// 添加一个工具函数来过滤思考内容和检测是否在思考
const messageProcessor = {
  filterThinkingContent: (content: string): string => {
    // 找到第一个左括号的位置
    const firstLeftBracket = content.search(/[（(]/);
    if (firstLeftBracket === -1) return content;

    // 使用栈来匹配括号
    const stack: string[] = [];
    let rightBracketPos = -1;
    
    for (let i = firstLeftBracket; i < content.length; i++) {
      const char = content[i];
      if (char === '(' || char === '（') {
        stack.push(char);
      } else if (char === ')' || char === '）') {
        stack.pop();
        if (stack.length === 0) {
          rightBracketPos = i;
          break;
        }
      }
    }

    if (rightBracketPos === -1) return content; // 没找到匹配的右括号

    // 只移除第一对匹配的括号内容
    return content.slice(0, firstLeftBracket) + content.slice(rightBracketPos + 1);
  },
  
  isThinking: (content: string): boolean => {
    // 找到第一个左括号的位置
    const firstLeftBracket = content.search(/[（(]/);
    if (firstLeftBracket === -1) return false;

    // 使用栈来匹配括号
    const stack: string[] = [];
    
    for (let i = firstLeftBracket; i < content.length; i++) {
      const char = content[i];
      if (char === '(' || char === '（') {
        stack.push(char);
      } else if (char === ')' || char === '）') {
        stack.pop();
        if (stack.length === 0) {
          return false; // 找到了匹配的右括号
        }
      }
    }
    
    return stack.length > 0; // 如果栈不为空，说明还有未匹配的左括号
  },
  
  processMessage: (msg: Message): Message => {
    if (msg.role !== 'ai') return msg;
    
    const isThinking = messageProcessor.isThinking(msg.content);
    
    return {
      ...msg,
      content: isThinking ? '' : messageProcessor.filterThinkingContent(msg.content),
      isThinking: isThinking
    };
  }
};

// Main component
function ChatHistoryPanel(): JSX.Element {
  const { messages } = useChatHistory();
  const { confName } = useConfig();
  const { baseUrl } = useWebSocket();
  const userName = "Me";

  // 处理消息
  const validMessages = messages
    .filter((msg) => msg.content && msg.content.trim().length > 0)
    .map(messageProcessor.processMessage)
    .filter((msg) => msg.content.length > 0 || msg.isThinking); // 保留思考中的消息

  // 检查是否有消息正在思考
  const hasThinkingMessage = messages.length > 0 && 
    messageProcessor.isThinking(messages[messages.length - 1].content);

  return (
    <Box
      h="full"
      overflow="hidden"
      bg="gray.900"
    >
      <Global styles={chatPanelStyles} />
      <MainContainer>
        <ChatContainer>
          <ChatMessageList>
            {validMessages.length === 0 ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                color="whiteAlpha.500"
                fontSize="sm"
              >
                No messages yet. Start a conversation!
              </Box>
            ) : (
              <>
                {validMessages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    model={{
                      type: "custom",
                      sender: msg.role === 'ai'
                        ? (msg.name || confName || 'AI')
                        : userName,
                      direction: msg.role === 'ai' ? 'incoming' : 'outgoing',
                      position: 'single',
                    }}
                    avatarPosition={msg.role === 'ai' ? 'tl' : 'tr'}
                    avatarSpacer={false}
                  >
                    <ChatAvatar>
                      {msg.role === 'ai' ? (
                        msg.avatar ? (
                          <img
                            src={`${baseUrl}/avatars/${msg.avatar}`}
                            alt="avatar"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              borderRadius: '50%',
                              objectFit: 'cover',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          />
                        ) : (
                          <Box
                            w="100%"
                            h="100%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg="blue.50"
                            color="blue.600"
                            borderRadius="50%"
                            fontSize="lg"
                            fontWeight="bold"
                          >
                            {(msg.name && msg.name[0].toUpperCase()) ||
                              (confName && confName[0].toUpperCase()) ||
                              'A'}
                          </Box>
                        )
                      ) : (
                        <Box
                          w="100%"
                          h="100%"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bg="green.50"
                          color="green.600"
                          borderRadius="50%"
                          fontSize="lg"
                          fontWeight="bold"
                        >
                          {userName[0].toUpperCase()}
                        </Box>
                      )}
                    </ChatAvatar>
                    <ChatMessage.CustomContent>
                      <div className={`ml-2 py-3 px-4 bg-gray-100 rounded-tr-2xl rounded-b-2xl`}>
                        {msg.isThinking ? (
                          <Box
                            className="thinking-indicator"
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <span className="dot-animation">...</span>
                            正在思考
                          </Box>
                        ) : (
                          <Markdown content={msg.content} />
                        )}
                      </div>
                    </ChatMessage.CustomContent>
                  </ChatMessage>
                ))}
              </>
            )}
          </ChatMessageList>
        </ChatContainer>
      </MainContainer>
    </Box>
  );
}

export default ChatHistoryPanel;
