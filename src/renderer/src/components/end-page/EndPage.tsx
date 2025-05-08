import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  Link,
} from '@chakra-ui/react';
import { useWebSocket } from '@/context/websocket-context';
import { isMobile } from '@/utils/device-utils';

interface EndPageProps {
  onRestart: () => void;
}

export function EndPage({ onRestart }: EndPageProps): JSX.Element {
  const { baseUrl } = useWebSocket();
  const [isMobileView, setIsMobileView] = React.useState(isMobile());
  const surveyUrl = "https://www.wjx.cn/vm/QITUwIW.aspx"; // 替换为实际的问卷地址

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      p={isMobileView ? "4" : "6"}
    >
      <VStack
        gap={8}
        width={isMobileView ? "100%" : "80%"}
        maxWidth="600px"
        align="center"
      >
        <Box 
          width={isMobileView ? "240px" : "360px"} 
          mb={4}
        >
          <img
            src={`${baseUrl}/logo/logo-site.png`}
            alt="Site Logo"
            style={{ 
              width: '100%',
              height: 'auto',
              maxWidth: '100%'
            }}
          />
        </Box>

        <VStack gap={4} align="center">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            感谢您的使用！
          </Text>
          <Text fontSize="lg" color="gray.600" textAlign="center">
            为了帮助我们提供更好的服务，请花几分钟时间填写问卷
          </Text>
          <Link
            href={surveyUrl}
            target="_blank"
            _hover={{ textDecoration: 'none' }}
          >
            <Button
              colorScheme="blue"
              size="lg"
              width="200px"
            >
              填写问卷
            </Button>
          </Link>
        </VStack>

        <Button
          variant="ghost"
          onClick={onRestart}
          mt={4}
        >
          重新开始
        </Button>
      </VStack>
    </Box>
  );
} 