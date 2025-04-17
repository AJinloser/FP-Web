import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Markdown } from './sidebar/markdown';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface FloatingWindowProps {
  content: string;
  visible: boolean;
  onClose: () => void;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = memo(({
  content,
  visible,
  onClose
}) => {
  const [position, setPosition] = useState(() => ({
    x: Math.min(window.innerWidth - 400, window.innerWidth - 20),
    y: 20
  }));
  const [size, setSize] = useState({ width: 300, height: 200 });
  const windowRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      isDragging.current = true;
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    isResizing.current = true;
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging.current) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.current.y));
      
      setPosition({
        x: newX,
        y: newY
      });
    } else if (isResizing.current) {
      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;
      
      const newWidth = Math.max(500, Math.min(1200, resizeStart.current.width + deltaX));
      const newHeight = Math.max(300, Math.min(800, resizeStart.current.height + deltaY));
      
      setSize({
        width: newWidth,
        height: newHeight
      });
    }
  }, [size.width, size.height]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
  }, []);

  useEffect(() => {
    if (visible) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [visible, handleMouseMove, handleMouseUp]);

  // 添加缩放手柄的样式
  const resizeHandleStyle = {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '20px',
    height: '20px',
    cursor: 'nwse-resize',
    background: `linear-gradient(135deg, transparent 0%, transparent 50%, #cbd5e0 50%, #cbd5e0 100%)`,
    opacity: 0.5,
    transition: 'opacity 0.2s'
  } as const;

  // 确保点击关闭按钮时调用 onClose
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();  // 防止事件冒泡
    onClose();
  };

  if (!visible) return null;

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <div 
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'move',
            userSelect: 'none'
          }}
          onMouseDown={handleMouseDown}
        >
          <span style={{ fontWeight: 500, color: '#374151' }}>特殊内容显示</span>
          <Button
            variant="ghost"
            style={{
              width: '28px',
              height: '28px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
            onClick={handleClose}
          >
            <X className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
        <div 
          style={{
            padding: '24px',
            overflow: 'auto',
            flex: 1,
            backgroundColor: '#ffffff'
          }}
          className="markdown-container"
        >
          <div style={{ maxWidth: 'none' }}>
            <Markdown content={content} />
          </div>
        </div>
        <div
          className="resize-handle"
          style={resizeHandleStyle}
          onMouseDown={handleResizeStart}
        />
      </div>
    </div>
  );
});

FloatingWindow.displayName = 'FloatingWindow';

// 更新全局样式
const globalStyles = `
.markdown-container .markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  border: 1px solid #e2e8f0;
}

.markdown-container .markdown-body th,
.markdown-container .markdown-body td {
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  text-align: left;
}

.markdown-container .markdown-body th {
  background-color: #f8f9fa;
  font-weight: 500;
}

.markdown-container .markdown-body tr:nth-of-type(even) {
  background-color: #f8f9fa;
}
`;

// 将样式添加到文档头部
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet); 