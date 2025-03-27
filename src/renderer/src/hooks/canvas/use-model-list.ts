import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/context/websocket-context';
import { ModelInfo } from '@/context/live2d-config-context';

export function useModelList() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useWebSocket();

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    try {
      sendMessage({ type: 'fetch-model-list' });
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sendMessage]);

  useEffect(() => {
    const handleModelListUpdate = (event: CustomEvent<ModelInfo[]>) => {
      setModels(event.detail);
    };

    window.addEventListener('model-list-update', handleModelListUpdate as EventListener);
    // 移除自动加载
    // fetchModels();

    return () => {
      window.removeEventListener('model-list-update', handleModelListUpdate as EventListener);
    };
  }, []);

  return { models, isLoading, fetchModels }; // 导出 fetchModels 函数
} 