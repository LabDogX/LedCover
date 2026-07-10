import { BackgroundEdit, EditableElement } from '../types';

export interface ParsedResult {
  editableElements: EditableElement[];
  background: BackgroundEdit | null;
}

/**
 * 解析 HTML 字符串，提取可编辑元素和背景信息
 */
export function parseHtmlForEditing(html: string): ParsedResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rootElement = doc.body.firstElementChild as HTMLElement;

  if (!rootElement) {
    return { editableElements: [], background: null };
  }

  // 提取可编辑元素
  const editableElements: EditableElement[] = [];

  // 计数器，与 markEditableElements 中的逻辑完全一致
  let headingIndex = 0;
  let paragraphIndex = 0;
  let tagIndex = 0;
  let emojiIndex = 0;

  // 查找标题 (h1, h2, h3) - 只提取有文本内容的
  const headings = rootElement.querySelectorAll('h1, h2, h3');
  headings.forEach((heading) => {
    const text = heading.textContent?.trim() || '';
    if (text) {
      const element = heading as HTMLElement;
      const color = element.style.color || undefined;
      const textAlign = element.style.textAlign;
      const fontFamily = element.style.fontFamily || undefined;

      // 确定对齐方式：优先使用内联样式，否则默认为 center
      let align: 'left' | 'center' | 'right' = 'center'; // 默认居中
      if (textAlign === 'left' || textAlign === 'center' || textAlign === 'right') {
        align = textAlign;
      }

      editableElements.push({
        id: `heading-${headingIndex}`,
        type: 'title',
        text,
        placeholder: '编辑标题',
        color,
        align,
        fontFamily,
      });
      headingIndex++;
    }
  });

  // 查找副标题 (p 标签，长度小于100字符) - 只提取有文本内容的
  const paragraphs = rootElement.querySelectorAll('p');
  paragraphs.forEach((p) => {
    const text = p.textContent?.trim();
    if (text && text.length < 100 && text.length > 0) {
      const element = p as HTMLElement;
      const color = element.style.color || undefined;
      const textAlign = element.style.textAlign;
      const fontFamily = element.style.fontFamily || undefined;

      // 确定对齐方式：优先使用内联样式，否则默认为 center
      let align: 'left' | 'center' | 'right' = 'center'; // 默认居中
      if (textAlign === 'left' || textAlign === 'center' || textAlign === 'right') {
        align = textAlign;
      }

      editableElements.push({
        id: `paragraph-${paragraphIndex}`,
        type: 'subtitle',
        text,
        placeholder: '编辑副标题',
        color,
        align,
        fontFamily,
      });
      paragraphIndex++;
    }
  });

  // 查找标签（span 包含在某些容器中）
  const tags = rootElement.querySelectorAll('span');
  const seenTagTexts = new Set<string>(); // 用于避免重复
  tags.forEach((span) => {
    const text = span.textContent?.trim();
    // 标签通常是短文本，大写字母或关键词
    if (text && text.length < 30 && text.length > 1 && text === text.toUpperCase()) {
      // 避免重复（与 markEditableElements 中的遍历顺序一致）
      if (!seenTagTexts.has(text)) {
        const element = span as HTMLElement;
        const color = element.style.color || undefined;
        const textAlign = element.style.textAlign;
        const fontFamily = element.style.fontFamily || undefined;

        // 确定对齐方式：优先使用内联样式，否则默认为 center
        let align: 'left' | 'center' | 'right' = 'center'; // 默认居中
        if (textAlign === 'left' || textAlign === 'center' || textAlign === 'right') {
          align = textAlign;
        }

        editableElements.push({
          id: `tag-${tagIndex}`,
          type: 'tag',
          text,
          placeholder: '编辑标签',
          color,
          align,
          fontFamily,
        });
        seenTagTexts.add(text);
        tagIndex++;
      }
    }
  });

  // 查找 Emoji（模板中显式标记）
  const emojiElements = rootElement.querySelectorAll('[data-editable-type="emoji"]');
  emojiElements.forEach((emoji) => {
    const text = emoji.textContent?.trim();
    if (text) {
      const element = emoji as HTMLElement;
      const color = element.style.color || undefined;
      const textAlign = element.style.textAlign;
      const fontFamily = element.style.fontFamily || undefined;

      let align: 'left' | 'center' | 'right' = 'center';
      if (textAlign === 'left' || textAlign === 'center' || textAlign === 'right') {
        align = textAlign;
      }

      editableElements.push({
        id: element.getAttribute('data-editable-id') || `emoji-${emojiIndex}`,
        type: 'emoji',
        text,
        placeholder: '编辑 Emoji',
        color,
        align,
        fontFamily,
      });
      emojiIndex++;
    }
  });

  // 分析背景
  const background = parseBackground(rootElement);

  return { editableElements, background };
}

/**
 * 分析元素的背景样式
 */
function parseBackground(element: HTMLElement): BackgroundEdit | null {
  const bgStyle = element.style.background;
  const bgImage = element.style.backgroundImage;

  // 检查是否已有图片
  if (bgImage && bgImage !== 'none') {
    const urlMatch = bgImage.match(/url\(["']?(.+?)["']?\)/);
    return {
      type: 'image',
      value: urlMatch ? urlMatch[1] : '',
      blur: 0,
      imagePosition: { x: 0, y: 0 },
      imageScale: 100,
      overlayOpacity: 0,
      overlayColor: '#000000',
    };
  }

  // 检查渐变
  if (bgStyle && bgStyle.includes('gradient')) {
    return {
      type: 'gradient',
      value: bgStyle,
    };
  }

  // 检查纯色
  const computedBg = element.style.backgroundColor || bgStyle;
  if (computedBg && (computedBg.match(/^#[0-9a-f]{3,8}$/i) || computedBg.startsWith('rgb'))) {
    return {
      type: 'solid',
      value: computedBg,
    };
  }

  return null;
}

/**
 * 给可编辑元素添加 data-editable-id 标记
 * 返回标记后的 HTML 字符串
 */
export function markEditableElements(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rootElement = doc.body.firstElementChild as HTMLElement;

  if (!rootElement) return html;

  // 计数器，与 parseHtmlForEditing 中的逻辑完全一致
  let headingIndex = 0;
  let paragraphIndex = 0;
  let tagIndex = 0;
  let emojiIndex = 0;

  // 标记标题 (h1, h2, h3) - 只标记有文本内容的
  const headings = rootElement.querySelectorAll('h1, h2, h3');
  headings.forEach((heading) => {
    const text = heading.textContent?.trim() || '';
    if (text) {
      (heading as HTMLElement).setAttribute('data-editable-id', `heading-${headingIndex}`);
      headingIndex++;
    }
  });

  // 标记段落 (p 标签，长度小于100字符) - 只标记有文本内容的
  const paragraphs = rootElement.querySelectorAll('p');
  paragraphs.forEach((p) => {
    const text = p.textContent?.trim();
    if (text && text.length < 100 && text.length > 0) {
      (p as HTMLElement).setAttribute('data-editable-id', `paragraph-${paragraphIndex}`);
      paragraphIndex++;
    }
  });

  // 标记标签（span 包含在某些容器中）
  const tags = rootElement.querySelectorAll('span');
  tags.forEach((span) => {
    const text = span.textContent?.trim();
    if (text && text.length < 30 && text.length > 1 && text === text.toUpperCase()) {
      (span as HTMLElement).setAttribute('data-editable-id', `tag-${tagIndex}`);
      tagIndex++;
    }
  });

  // 标记模板中的 Emoji 元素
  const emojiElements = rootElement.querySelectorAll('[data-editable-type="emoji"]');
  emojiElements.forEach((emoji) => {
    const text = emoji.textContent?.trim();
    if (text) {
      (emoji as HTMLElement).setAttribute('data-editable-id', `emoji-${emojiIndex}`);
      emojiIndex++;
    }
  });

  return rootElement.outerHTML;
}

/**
 * 查找并返回遮罩层元素
 */
export function findOverlayElement(html: string): HTMLElement | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rootElement = doc.body.firstElementChild as HTMLElement;

  if (!rootElement) return null;

  return rootElement.querySelector('[data-overlay="true"]') as HTMLElement;
}
