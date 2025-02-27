/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { useEffect, useRef, useCallback, useState } from "react";
import { ModelInfo, useLive2DConfig } from "@/context/live2d-config-context";
import { useLive2DModel as useModelContext } from "@/context/live2d-model-context";
import { AiStateEnum, useAiState } from "@/context/ai-state-context";
import { toaster } from "@/components/ui/toaster";
import { updateModelConfig } from '../../../live2d/lappdefine';

interface UseLive2DModelProps {
  isPet: boolean;
  modelInfo: ModelInfo | undefined;
}

interface Position {
  x: number;
  y: number;
}

// Helper function to parse model URL and reload model
function parseModelUrl(url: string): { baseUrl: string; modelDir: string; modelFileName: string } {
  try {
    console.log('Parsing URL:', url);
    const urlObj = new URL(url);
    const { pathname } = urlObj;

    // Find the last slash
    const lastSlashIndex = pathname.lastIndexOf('/');
    if (lastSlashIndex === -1) {
      throw new Error('Invalid model URL format');
    }

    // Get full file name with extension (e.g., "name2.model3.json")
    const fullFileName = pathname.substring(lastSlashIndex + 1);
    
    // Extract model file name without extension (e.g., "name2")
    const modelFileName = fullFileName.replace('.model3.json', '');

    // Find the second to last slash
    const secondLastSlashIndex = pathname.lastIndexOf('/', lastSlashIndex - 1);
    if (secondLastSlashIndex === -1) {
      throw new Error('Invalid model URL format');
    }

    // Extract model directory - it's between the last two slashes
    const modelDir = pathname.substring(secondLastSlashIndex + 1, lastSlashIndex);

    // Base URL is everything up to the model directory
    const baseUrl = `${urlObj.protocol}//${urlObj.host}${pathname.substring(0, secondLastSlashIndex + 1)}`;

    console.log('Parsed URL successfully:', { baseUrl, modelDir, modelFileName });
    return { baseUrl, modelDir, modelFileName };
  } catch (error) {
    console.error('Error parsing model URL:', error);
    return { baseUrl: '', modelDir: '', modelFileName: '' };
  }
}

/**
 * Hook to handle Live2D model initialization and dragging
 */
export const useLive2DModel = ({
  isPet,
  modelInfo,
}: UseLive2DModelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const elementStartPos = useRef<Position>({ x: 0, y: 0 });

  // Keep track of the previous model URL
  const prevModelUrlRef = useRef<string | null>(null);

  // Initialize Live2D SDK
  useEffect(() => {
    // Load Live2D initialization script
    const script = document.createElement('script');
    script.src = './live2d/main.ts';
    script.type = 'module';

    script.onload = () => {
      // Initialize Live2D after script is loaded
      if ((window as any).initializeLive2D) {
        (window as any).initializeLive2D();
      }
    };

    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const existingScripts = document.head.querySelectorAll('script[src*="live2d"]');
      existingScripts.forEach((scriptElement) => {
        document.head.removeChild(scriptElement);
      });
    };
  }, []);

  useEffect(() => {
    if (modelInfo?.url && modelInfo.url !== prevModelUrlRef.current) {
      console.log('Model URL changed. New URL:', modelInfo.url);
      prevModelUrlRef.current = modelInfo.url;

      try {
        // Parse URL
        const { baseUrl, modelDir, modelFileName } = parseModelUrl(modelInfo.url);

        if (baseUrl && modelDir) {
          console.log('Updating model config and reloading model:', { baseUrl, modelDir, modelFileName });

          // Update model configuration
          updateModelConfig(baseUrl, modelDir, modelFileName);
          
          // Force model reload by reinitializing Live2D
          setTimeout(() => {
            if ((window as any).initializeLive2D) {
              console.log('Reinitializing Live2D...');

              // First release existing resources
              if ((window as any).LAppLive2DManager &&
                  (window as any).LAppLive2DManager.releaseInstance) {
                (window as any).LAppLive2DManager.releaseInstance();
              }

              // Then reinitialize
              (window as any).initializeLive2D();
            } else {
              console.error('initializeLive2D function not found');
            }
          }, 100); // Short delay to ensure config is updated
        }
      } catch (error) {
        console.error('Error processing model URL:', error);
      }
    }
  }, [modelInfo?.url]);

  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = position;
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    setPosition({
      x: elementStartPos.current.x + dx,
      y: elementStartPos.current.y + dy,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    position,
    isDragging,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
  };
};
