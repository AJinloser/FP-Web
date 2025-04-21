import { Box, Text } from '@chakra-ui/react';
import { memo, useEffect, useState, useCallback } from 'react';
import { canvasStyles } from './canvas-styles';
import { useSubtitleDisplay } from '@/hooks/canvas/use-subtitle-display';
import { useSubtitle } from '@/context/subtitle-context';
import { motion, useAnimation } from 'framer-motion';

// 定义提示信息
const THINKING_TIPS = [
  "正在加速生成中...",
  "请耐心等待...",
  "正在思考您的问题...",
  "马上就好...",
  "正在整理答案..."
];

// 定义进度条卡点
const PROGRESS_CHECKPOINTS = [
  { progress: 25, delay: 1000 },
  { progress: 75, delay: 2000 },
  { progress: 99, delay: 3000 }
];

// Type definitions
interface SubtitleTextProps {
  text: string
}

// Reusable components
const SubtitleText = memo(({ text }: SubtitleTextProps) => (
  <Text {...canvasStyles.subtitle.text}>
    {text}
  </Text>
));

SubtitleText.displayName = 'SubtitleText';

const ThinkingProgress = memo(() => {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const controls = useAnimation();

  const getRandomDuration = () => {
    return 0.3 + Math.random() * 0.7; // 返回0.3到1秒之间的随机时间
  };

  const animateProgress = useCallback(async () => {
    // 初始快速增长到15%
    await controls.start({
      width: "15%",
      transition: { duration: getRandomDuration() }
    });
    setProgress(15);

    // 随机进度增长
    let currentProgress = 15;
    while (currentProgress < 99) {
      const increment = Math.floor(Math.random() * 15) + 5; // 每次增加5-20的随机值
      currentProgress = Math.min(99, currentProgress + increment);
      
      await controls.start({
        width: `${currentProgress}%`,
        transition: { 
          duration: getRandomDuration(),
          ease: "easeInOut"
        }
      });
      setProgress(currentProgress);
      
      // 随机暂停一段时间
      if (currentProgress < 99) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      }
    }
  }, [controls]);

  useEffect(() => {
    animateProgress();
  }, [animateProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % THINKING_TIPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%">
        <Text {...canvasStyles.subtitle.tip}>
          {THINKING_TIPS[tipIndex]}
        </Text>
        <Box width="100%" display="flex" alignItems="center" gap={4}>
          <Box flex={1} {...canvasStyles.subtitle.progressContainer}>
            <motion.div
              initial={{ width: "0%" }}
              animate={controls}
              style={canvasStyles.subtitle.progressBar}
            />
          </Box>
          <Text
            color="white"
            fontSize="sm"
            opacity={0.8}
            minWidth="3.5em"
            textAlign="right"
          >
            {progress}%
          </Text>
        </Box>
      </Box>
    </>
  );
});

ThinkingProgress.displayName = 'ThinkingProgress';

// Main component
const Subtitle = memo((): JSX.Element | null => {
  const { subtitleText, isLoaded } = useSubtitleDisplay();
  const { showSubtitle } = useSubtitle();
  const [showProgress, setShowProgress] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (subtitleText === "Thinking...") {
      setShowProgress(true);
    } else if (subtitleText && showProgress) {
      controls.start({
        width: "100%",
        transition: { duration: 0.3 }
      }).then(() => {
        setShowProgress(false);
      });
    }
  }, [subtitleText, controls]);

  if (!isLoaded || !showSubtitle) return null;

  return (
    <Box {...canvasStyles.subtitle.container}>
      {showProgress ? (
        <ThinkingProgress />
      ) : (
        <SubtitleText text={subtitleText || ''} />
      )}
    </Box>
  );
});

Subtitle.displayName = 'Subtitle';

export default Subtitle;
