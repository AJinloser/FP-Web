import { Box } from '@chakra-ui/react';
import Background from './background';
import Subtitle from './subtitle';
import WebSocketStatus from './ws-status';
import { Live2D } from './live2d';
import { ModelSelector } from './model-selector';
import { canvasStyles } from './canvas-styles';
import { isMobile } from '@/utils/device-utils';

function Canvas(): JSX.Element {
  const isMobileView = isMobile();

  return (
    <Background>
      <Box {...canvasStyles.canvas.container}>
        <Live2D isPet={false} />
        <WebSocketStatus />
        {/* <ModelSelector /> */}
        {!isMobileView && <Subtitle />}
      </Box>
    </Background>
  );
}

export default Canvas;
