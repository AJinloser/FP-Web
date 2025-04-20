/* eslint-disable no-nested-ternary */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/require-default-props */
import { Box } from '@chakra-ui/react';
import {
  memo, useEffect, useRef, useCallback, useState, useMemo,
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
import { FloatingWindow } from '../FloatingWindow';
import { splitMessageContent } from '../../utils/contentSplitter';

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

// Main component
export const ChatHistoryPanel: React.FC = () => {
  const { messages } = useChatHistory();
  const { confName } = useConfig();
  const { baseUrl } = useWebSocket();
  const userName = "Me";

  // 创建一个事件发送器，用于通知 App 组件显示特殊内容
  const emitSpecialContent = useCallback((content: string) => {
    window.dispatchEvent(new CustomEvent('special-content-update', {
      detail: { content }
    }));
  }, []);

  const currentSpecialMessageId = useRef<string | null>(null);

  const renderMessage = (msg: Message) => {
    if (msg.role === 'ai') {
      const isLatestMessage = messages[messages.length - 1]?.id === msg.id;
      const { plainText, specialContent, isSpecialContentComplete } = splitMessageContent(msg.content);
      
      if (isLatestMessage) {
        if (specialContent && 
            specialContent.trim() && 
            isSpecialContentComplete && 
            currentSpecialMessageId.current !== msg.id) {
          console.log('发送特殊内容到悬浮窗', specialContent);
          emitSpecialContent(specialContent);
          currentSpecialMessageId.current = msg.id;
        }
        
        return (
          <div className="flex flex-col space-y-2">
            <Markdown content={plainText} />
          </div>
        );
      } 
      else if (msg.id === currentSpecialMessageId.current) {
        currentSpecialMessageId.current = null;
        console.log('显示完整内容', msg.content);
        return (
          <div className="flex flex-col space-y-2">
            <Markdown content={msg.content} />
          </div>
        );
      }
      else {
        return (
          <div className="flex flex-col space-y-2">
            <Markdown content={msg.content} />
          </div>
        );
      }
    }
    
    return <Markdown content={msg.content} />;
  };

  // 监听悬浮窗关闭事件
  useEffect(() => {
    const handleFloatingClose = () => {
      // 强制重新渲染以显示完整内容
      if (currentSpecialMessageId.current) {
        const messageId = currentSpecialMessageId.current;
        currentSpecialMessageId.current = null;
        // 找到对应的消息并更新其显示
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
          messageElement.innerHTML = messageElement.innerHTML; // 触发重新渲染
        }
      }
    };

    window.addEventListener('floating-window-close', handleFloatingClose);
    return () => {
      window.removeEventListener('floating-window-close', handleFloatingClose);
    };
  }, []);

  return (
    <>
      <Box
        h="full"
        overflow="hidden"
        bg="gray.900"
      >
        <Global styles={chatPanelStyles} />
        <MainContainer>
          <ChatContainer>
            <ChatMessageList>
              {messages.length === 0 ? (
                <ChatMessage
                  model={{
                    type: "custom",
                    sender: "System",
                    direction: "incoming",
                    position: "single"
                  }}
                >
                  <ChatMessage.CustomContent>
                    <div className="ml-2 py-3 px-4 bg-gray-100 rounded-tr-2xl rounded-b-2xl">
                    我是水木云帆团队开发的智能体，欢迎来到我们的人生规划与风险保障平台。本平台跟任何保险公司无利益关联，我们秉承中立、公正原则，信息均采集至公开渠道，由大模型智能体生成，仅供参考。
                    </div>
                  </ChatMessage.CustomContent>
                </ChatMessage>
              ) : (
                messages.map((msg) => (
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
                        <img
                          src={`${baseUrl}/logo/logo-embedded-chat-avatar.png`}
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
                        {renderMessage(msg)}
                      </div>
                    </ChatMessage.CustomContent>
                  </ChatMessage>
                ))
              )}
            </ChatMessageList>
          </ChatContainer>
        </MainContainer>
      </Box>
    </>
  );
};

export default ChatHistoryPanel;
