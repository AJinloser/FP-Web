import { useVAD } from '@/context/vad-context';
import { useAiState } from '@/context/ai-state-context';

export function useMicToggle() {
  const { startMic, stopMic, micOn } = useVAD();
  const { aiState, setAiState } = useAiState();

  const handleMicToggle = () => {
    // 如果 AI 正在说话，不允许任何麦克风操作
    if (aiState === 'thinking-speaking') {
      return false; // 返回 false 表示操作被拒绝
    }

    if (micOn) {
      stopMic();
      setAiState('idle');
    } else {
      startMic();
      setAiState('waiting');
    }
    return true; // 返回 true 表示操作成功
  };

  return {
    handleMicToggle,
    micOn,
  };
}
