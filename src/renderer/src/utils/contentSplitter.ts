interface SplitContent {
  plainText: string;
  specialContent: string;
  isSpecialContentComplete: boolean; // 新增标志，表示特殊内容是否完整
}

export const splitMessageContent = (content: string): SplitContent => {
  const result: SplitContent = {
    plainText: '',
    specialContent: '',
    isSpecialContentComplete: false
  };

  const lines = content.split('\n');
  let inCodeBlock = false;
  let inTable = false;
  let specialBuffer = '';
  let plainBuffer = '';
  let codeBlockContent = '';
  let tableContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

    // 处理代码块
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // 代码块开始
        inCodeBlock = true;
        codeBlockContent = line + '\n';
        console.log('代码块开始', codeBlockContent);
      } else {
        // 代码块结束
        inCodeBlock = false;
        codeBlockContent += line;
        specialBuffer += codeBlockContent + '\n';
        result.isSpecialContentComplete = true; // 代码块完成
        codeBlockContent = '';
        console.log('代码块结束', specialBuffer);
      }
      continue;
    }

    // 在代码块内
    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      continue;
    }

    // 处理表格
    if (line.includes('|')) {
      if (!inTable) {
        // 表格开始
        inTable = true;
        tableContent = line + '\n';
        console.log('表格开始', tableContent);
      } else {
        // 表格继续
        tableContent += line + '\n';
        console.log('表格继续', tableContent);
      }
      console.log('下一列', nextLine);
      // 检查表格是否结束
      if (!nextLine || !nextLine.includes('|')) {
        inTable = false;
        specialBuffer += tableContent;
        result.isSpecialContentComplete = true; // 表格完成
        tableContent = '';
        console.log('表格结束', specialBuffer);
      }
      continue;
    }

    // 普通文本
    if (!inTable && !inCodeBlock) {
      plainBuffer += line + '\n';
      // result.isSpecialContentComplete = false;
      console.log('普通文本', plainBuffer);
    }
  }

  // 处理最后可能残留的内容
  if (codeBlockContent) {
    specialBuffer += codeBlockContent;
    result.isSpecialContentComplete = false; // 代码块未完成
  }
  if (tableContent) {
    specialBuffer += tableContent;
    result.isSpecialContentComplete = false; // 表格未完成
  }

  return {
    plainText: plainBuffer.trim(),
    specialContent: specialBuffer.trim(),
    isSpecialContentComplete: result.isSpecialContentComplete
  };
}; 