/* eslint-disable react/require-default-props */
import {
  Box, Textarea, IconButton, HStack, Text,
} from '@chakra-ui/react';
import { BsMicFill, BsMicMuteFill, BsPaperclip, BsSend } from 'react-icons/bs';
import { IoHandRightSharp } from 'react-icons/io5';
import { FiChevronDown } from 'react-icons/fi';
import { memo, useEffect, useState, useCallback } from 'react';
import { InputGroup } from '@/components/ui/input-group';
import { footerStyles } from './footer-styles';
import AIStateIndicator from './ai-state-indicator';
import { useFooter } from '@/hooks/footer/use-footer';
import { VoiceIndicator } from '@/components/voice/VoiceIndicator';
import { useAiState } from '@/context/ai-state-context';

// Type definitions
interface FooterProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

interface ToggleButtonProps {
  isCollapsed: boolean
  onToggle?: () => void
}

interface ActionButtonsProps {
  micOn: boolean
  onMicToggle: () => void
  onInterrupt: () => void
}

interface MessageInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onCompositionStart: () => void
  onCompositionEnd: () => void
}

// Reusable components
const ToggleButton = memo(({ isCollapsed, onToggle }: ToggleButtonProps) => (
  <Box
    {...footerStyles.footer.toggleButton}
    onClick={onToggle}
    color="whiteAlpha.500"
    style={{
      transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
    }}
  >
    <FiChevronDown />
  </Box>
));

ToggleButton.displayName = 'ToggleButton';

const ActionButtons = memo(({ micOn, onMicToggle, onInterrupt }: ActionButtonsProps) => {
  return (
    <Box position="relative">
      <HStack gap={2}>
        <IconButton
          {...footerStyles.footer.actionButton}
          onClick={onMicToggle}
        >
          {micOn ? <BsMicFill /> : <BsMicMuteFill />}
        </IconButton>
        <IconButton
          aria-label="Raise hand"
          {...footerStyles.footer.actionButton}
          onClick={onInterrupt}
        >
          <IoHandRightSharp size="24" />
        </IconButton>
      </HStack>
    </Box>
  );
});

ActionButtons.displayName = 'ActionButtons';

const MessageInput = memo(({
  value,
  onChange,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  onSend,
}: MessageInputProps & { onSend: () => void }) => {
  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      const message = event.detail;
      if (message.type === 'user-input-transcription' && message.text) {
        onChange({
          target: {
            value: (prevValue => {
              const prefix = prevValue.trim() ? `${prevValue.trim()} ` : '';
              return `${prefix}${message.text}`;
            })(value)
          }
        } as React.ChangeEvent<HTMLTextAreaElement>);
      }
    };

    window.addEventListener('websocket-message', handleMessage as EventListener);
    return () => {
      window.removeEventListener('websocket-message', handleMessage as EventListener);
    };
  }, [onChange, value]);

  return (
    <InputGroup flex={1}>
      <Box position="relative" width="100%">
        <IconButton
          aria-label="Attach file"
          variant="ghost"
          {...footerStyles.footer.attachButton}
        >
          <BsPaperclip size="24" />
        </IconButton>
        <Textarea
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          placeholder="Type your message..."
          {...footerStyles.footer.input}
        />
        <IconButton
          aria-label="Send message"
          onClick={onSend}
          disabled={!value.trim()}
          {...footerStyles.footer.actionButton}
          position="absolute"
          right="2"
          bottom="2"
        >
          <BsSend />
        </IconButton>
      </Box>
    </InputGroup>
  );
});

MessageInput.displayName = 'MessageInput';

// Main component
function Footer({ isCollapsed = false, onToggle }: FooterProps): JSX.Element {
  const {
    inputValue,
    handleInputChange,
    handleKeyPress,
    handleCompositionStart,
    handleCompositionEnd,
    handleInterrupt,
    handleMicToggle,
    micOn,
    handleSend,
  } = useFooter();

  const [showVoiceIndicator, setShowVoiceIndicator] = useState(false);
  const { aiState } = useAiState();

  const handleMicClick = useCallback(() => {
    if (aiState === 'thinking-speaking') {
      return;
    }

    const success = handleMicToggle();
    
    if (success) {
      setShowVoiceIndicator(prev => !micOn);
    }
  }, [handleMicToggle, micOn, aiState]);

  useEffect(() => {
    if (aiState === 'thinking-speaking') {
      setShowVoiceIndicator(false);
    }
  }, [aiState]);

  useEffect(() => {
    if (!micOn) {
      setShowVoiceIndicator(false);
    }
  }, [micOn]);

  return (
    <Box position="relative">
      <VoiceIndicator show={showVoiceIndicator && aiState !== 'thinking-speaking'} />
      <Box {...footerStyles.footer.container(isCollapsed)}>
        <ToggleButton isCollapsed={isCollapsed} onToggle={onToggle} />

        <Box pt="0" px="4">
          <HStack width="100%" gap={4}>
            <Box>
              <Box mb="1.5">
                <AIStateIndicator />
              </Box>
              <ActionButtons
                micOn={micOn}
                onMicToggle={handleMicClick}
                onInterrupt={handleInterrupt}
              />
            </Box>

            <MessageInput
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onSend={handleSend}
            />
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
