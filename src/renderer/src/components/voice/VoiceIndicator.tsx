import { Box, Text } from '@chakra-ui/react';
import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface VoiceIndicatorProps {
  show: boolean;
  position?: 'top' | 'bottom';
}

const WaveAnimation = memo(({ volume }: { volume: number }) => {
  const bars = Array.from({ length: 10 }, (_, i) => i);
  
  return (
    <Box 
      width="100%" 
      height="40px" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      gap="2px"
    >
      {bars.map((bar) => (
        <motion.div
          key={bar}
          initial={{ height: "2px" }}
          animate={{ 
            height: `${Math.max(2, Math.min(40, volume * 40 * Math.random()))}px`,
            backgroundColor: volume > 0.5 ? "#48BB78" : "#90CDF4"
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.5
          }}
          style={{
            width: "4px",
            borderRadius: "2px",
            backgroundColor: "#48BB78",
          }}
        />
      ))}
    </Box>
  );
});

WaveAnimation.displayName = 'WaveAnimation';

export const VoiceIndicator = memo(({ show, position = 'top' }: VoiceIndicatorProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [statusText, setStatusText] = useState("正在录制中...");

  useEffect(() => {
    if (show) {
      setIsSpeaking(true);
      setStatusText("正在录制中...");
    }
  }, [show]);

  useEffect(() => {
    const handleVoiceState = (event: CustomEvent) => {
      const { type, isSpeaking: speaking, value } = event.detail;
      console.log('Voice state event:', type, speaking, value);
      
      if (!show) return;

      if (type === 'speech-state') {
        setIsSpeaking(speaking);
        if (speaking) {
          setStatusText("正在录制中...");
        } else {
          setStatusText("已经录制完成，正在处理中...");
        }
      } else if (type === 'volume') {
        setVolume(value);
      }
    };

    window.addEventListener('voice-state', handleVoiceState as EventListener);
    return () => {
      window.removeEventListener('voice-state', handleVoiceState as EventListener);
    };
  }, [show]);

  useEffect(() => {
    const handleMessage = (event: CustomEvent) => {
      const message = event.detail;
      if (!show) return;
      
      if (message.type === 'user-input-transcription' && message.text) {
        console.log('Received transcription, updating status');
        setStatusText("已处理完成，请继续输入");
      }
    };

    window.addEventListener('websocket-message', handleMessage as EventListener);
    return () => {
      window.removeEventListener('websocket-message', handleMessage as EventListener);
    };
  }, [show]);

  if (!show) return null;

  return (
    <Box
      position="absolute"
      {...(position === 'top' ? { bottom: '100%' } : { top: '100%' })}
      left="0"
      right="0"
      bg="white"
      {...(position === 'top' ? { borderTopRadius: 'xl' } : { borderBottomRadius: 'xl' })}
      boxShadow={position === 'top' 
        ? "0 -4px 12px rgba(0, 0, 0, 0.05)"
        : "0 4px 12px rgba(0, 0, 0, 0.05)"
      }
      p={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={3}
      zIndex={1}
    >
      <Text 
        fontSize="md" 
        color={isSpeaking ? "green.500" : "blue.500"} 
        fontWeight="medium"
      >
        {statusText}
      </Text>
      <Box 
        width="100%" 
        maxW="300px" 
        bg="gray.50" 
        borderRadius="lg" 
        p={2}
        border="1px"
        borderColor="gray.100"
      >
        <WaveAnimation volume={volume} />
      </Box>
    </Box>
  );
});

VoiceIndicator.displayName = 'VoiceIndicator'; 