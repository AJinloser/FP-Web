import { Box, Button, Portal, Menu } from '@chakra-ui/react';
import { FaRobot } from 'react-icons/fa';
import { useLive2DConfig } from '@/context/live2d-config-context';
// import { Menu } from '@/components/ui/menu';
import { canvasStyles } from './canvas-styles';
import { useModelList } from '@/hooks/canvas/use-model-list';
import { ModelInfo } from '@/context/live2d-config-context';

export function ModelSelector(): JSX.Element {
  const { setModelInfo } = useLive2DConfig();
  const { models, isLoading, fetchModels } = useModelList();

  const handleModelSelect = (model: ModelInfo) => {
    setModelInfo({
      ...model,
      emotionMap: {},  // 根据实际需求设置
      pointerInteractive: true
    });
  };

  // 添加点击处理函数
  const handleMenuOpen = () => {
    if (models.length === 0) {  // 只在模型列表为空时加载
      fetchModels();
    }
  };

  return (
    <Box {...canvasStyles.modelSelector.container}>
      <Menu.Root onOpenChange={handleMenuOpen}>  {/* 添加 onOpenChange 处理 */}
        <Menu.Trigger asChild>
          <Button
            aria-label="切换模型"
            {...canvasStyles.modelSelector.button}
            display="flex"
            alignItems="center"
            gap="2"
            loading={isLoading}
          >
            <FaRobot size={20} />
            <span>切换模型</span>
          </Button>
        </Menu.Trigger>
        <Portal>
            <Menu.Positioner>
            <Menu.Content>
                <Box {...canvasStyles.modelSelector.menu.container}>
                {models.map((model) => (
                    <Menu.Item
                    key={model.url}
                    onClick={() => handleModelSelect(model)}
                    value={model.url}
                    {...canvasStyles.modelSelector.menu.item}
                    >
                    {model.name}
                    </Menu.Item>
                ))}
                </Box>
            </Menu.Content>
            </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Box>
  );
}