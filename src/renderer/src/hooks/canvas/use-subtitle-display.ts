import { useMemo } from 'react';
import { useSubtitle } from '@/context/subtitle-context';
import { splitMessageContent } from '@/utils/contentSplitter';

export const useSubtitleDisplay = () => {
  const context = useSubtitle();

  const subtitleText = useMemo(() => {
    if (!context) return null;
    const { plainText } = splitMessageContent(context.subtitleText);
    return plainText;
  }, [context?.subtitleText]);

  return {
    subtitleText,
    isLoaded: !!context,
  };
};
