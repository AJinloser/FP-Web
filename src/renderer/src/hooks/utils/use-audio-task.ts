import { useRef, useEffect } from 'react';
import { useAiState } from '@/context/ai-state-context';
import { useSubtitle } from '@/context/subtitle-context';
import { useChatHistory } from '@/context/chat-history-context';
import { audioTaskQueue } from '@/utils/task-queue';
import { useLive2DModel } from '@/context/live2d-model-context';
import { toaster } from '@/components/ui/toaster';
import { useWebSocket } from '@/context/websocket-context';
import { DisplayText } from '@/services/websocket-service';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface AudioTaskOptions {
  audioBase64: string
  volumes: number[]
  sliceLength: number
  displayText?: DisplayText | null
  expressions?: string[] | number[] | null
  speaker_uid?: string
  forwarded?: boolean
}

export const useAudioTask = () => {
  const { aiState, backendSynthComplete, setBackendSynthComplete } = useAiState();
  const { setSubtitleText } = useSubtitle();
  const { appendResponse, appendAIMessage } = useChatHistory();
  const { currentModel } = useLive2DModel();
  const { sendMessage } = useWebSocket();

  const stateRef = useRef({
    aiState,
    currentModel,
    setSubtitleText,
    appendResponse,
    appendAIMessage,
  });

  stateRef.current = {
    aiState,
    currentModel,
    setSubtitleText,
    appendResponse,
    appendAIMessage,
  };

  const handleAudioPlayback = (options: AudioTaskOptions): Promise<void> => new Promise((resolve) => {
    const {
      aiState: currentAiState,
      currentModel: model,
      setSubtitleText: updateSubtitle,
      appendResponse: appendText,
      appendAIMessage: appendAI,
    } = stateRef.current;

    if (currentAiState === 'interrupted') {
      console.error('Audio playback blocked. State:', currentAiState);
      resolve();
      return;
    }

    const { audioBase64, displayText, expressions, forwarded } = options;

    if (displayText) {
      appendText(displayText.text);
      console.log('appendAI', displayText.message_id);
      appendAI(displayText.text, displayText.name, displayText.avatar, displayText.message_id);
      if (audioBase64) {
        updateSubtitle(displayText.text);
      }
      if (!forwarded) {
        sendMessage({
          type: "audio-play-start",
          display_text: displayText,
          forwarded: true,
        });
      }
    }

    try {
      if (model) {
        if (expressions?.[0] !== undefined) {
          model.expression(expressions[0]);
        }

        let isFinished = false;
        if (audioBase64) {
          model.speak(`data:audio/wav;base64,${audioBase64}`, {
            onFinish: () => {
              console.log("Voiceline is over");
              isFinished = true;
              resolve();
            },
            onError: (error) => {
              console.error("Audio playback error:", error);
              isFinished = true;
              resolve();
            },
          });

          const checkFinished = () => {
            if (!isFinished) {
              setTimeout(checkFinished, 100);
            }
          };
          checkFinished();
        } else {
          resolve();
        }
      } else {
        // 如果没有Live2D模型，使用Web Audio API播放音频
        if (audioBase64) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const audioData = atob(audioBase64);
          const arrayBuffer = new ArrayBuffer(audioData.length);
          const view = new Uint8Array(arrayBuffer);
          for (let i = 0; i < audioData.length; i++) {
            view[i] = audioData.charCodeAt(i);
          }
          
          audioContext.decodeAudioData(arrayBuffer, (buffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
            source.onended = () => {
              console.log("Voiceline is over");
              resolve();
            };
          }, (error) => {
            console.error("Audio decoding error:", error);
            resolve();
          });
        } else {
          resolve();
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      toaster.create({
        title: `Audio playback error: ${error}`,
        type: "error",
        duration: 2000,
      });
      resolve();
    }
  });

  useEffect(() => {
    let isMounted = true;

    const handleComplete = async () => {
      await audioTaskQueue.waitForCompletion();
      if (isMounted && backendSynthComplete) {
        sendMessage({ type: "frontend-playback-complete" });
        setBackendSynthComplete(false);
      }
    };

    handleComplete();

    return () => {
      isMounted = false;
    };
  }, [backendSynthComplete, sendMessage, setBackendSynthComplete]);

  const addAudioTask = async (options: AudioTaskOptions) => {
    const { aiState: currentState } = stateRef.current;

    if (currentState === 'interrupted') {
      console.log('Skipping audio task due to interrupted state');
      return;
    }

    console.log(`Adding audio task ${options.displayText?.text} to queue`);
    audioTaskQueue.addTask(() => handleAudioPlayback(options));
  };

  return {
    addAudioTask,
    appendResponse,
  };
};
