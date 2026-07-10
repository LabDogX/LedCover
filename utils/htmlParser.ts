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
  let footerIndex = 0;
  let decorationIndex = 0;

  const getCommonElementState = (element: HTMLElement) => {
    const color = element.style.color || undefined;
    const textAlign = element.style.textAlign;
    const fontFamily = element.style.fontFamily || undefined;

    let align: 'left' | 'center' | 'right' = 'center';
    if (textAlign === 'left' || textAlign === 'center' || textAlign === 'right') {
      align = textAlign;
    }

    const x = Number(element.getAttribute('data-position-x'));
    const y = Number(element.getAttribute('data-position-y'));
    const hasStoredPosition = Number.isFinite(x) && Number.isFinite(y);
    const styleX = parseFloat(element.style.left);
    const styleY = parseFloat(element.style.top);
    const hasStylePosition = element.style.position === 'absolute' && Number.isFinite(styleX) && Number.isFinite(styleY);

    return {
      color,
      align,
      fontFamily,
      visible: element.getAttribute('data-hidden') !== 'true' && element.style.display !== 'none',
      position: hasStoredPosition
        ? { x, y }
        : hasStylePosition
          ? { x: styleX, y: styleY }
          : undefined,
    };
  };

  // 查找标题 (h1, h2, h3) - 只提取有文本内容的
  const headings = rootElement.querySelectorAll('h1, h2, h3');
  headings.forEach((heading) => {
    const text = heading.textContent?.trim() || '';
    if (text) {
      const element = heading as HTMLElement;
      const commonState = getCommonElementState(element);

      editableElements.push({
        id: element.getAttribute('data-editable-id') || `heading-${headingIndex}`,
        type: 'title',
        text,
        placeholder: '编辑标题',
        ...commonState,
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
      const commonState = getCommonElementState(element);

      editableElements.push({
        id: element.getAttribute('data-editable-id') || `paragraph-${paragraphIndex}`,
        type: 'subtitle',
        text,
        placeholder: '编辑副标题',
        ...commonState,
      });
      paragraphIndex++;
    }
  });

  // 优先识别完整标签容器，隐藏时要连同其背景与装饰一起隐藏。
  const explicitTags = rootElement.querySelectorAll('[data-editable-type="tag"]');
  explicitTags.forEach((tag) => {
    const element = tag as HTMLElement;
    const text = element.textContent?.trim() || '标签';
    const commonState = getCommonElementState(element);

    editableElements.push({
      id: element.getAttribute('data-editable-id') || `tag-${tagIndex}`,
      type: 'tag',
      text,
      placeholder: '编辑标签',
      ...commonState,
    });
    tagIndex++;
  });

  // 兼容 AI 生成内容中的独立 span 标签。
  const tags = rootElement.querySelectorAll('span');
  const seenTagTexts = new Set<string>(); // 用于避免重复
  tags.forEach((span) => {
    const text = span.textContent?.trim();
    // 标签通常是短文本，大写字母或关键词
    if (
      text &&
      text.length < 30 &&
      text.length > 1 &&
      text === text.toUpperCase() &&
      !span.closest('[data-editable-type="tag"]')
    ) {
      // 避免重复（与 markEditableElements 中的遍历顺序一致）
      if (!seenTagTexts.has(text)) {
        const element = span as HTMLElement;
        const commonState = getCommonElementState(element);

        editableElements.push({
          id: element.getAttribute('data-editable-id') || `tag-${tagIndex}`,
          type: 'tag',
          text,
          placeholder: '编辑标签',
          ...commonState,
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
      const commonState = getCommonElementState(element);

      editableElements.push({
        id: element.getAttribute('data-editable-id') || `emoji-${emojiIndex}`,
        type: 'emoji',
        text,
        placeholder: '编辑 Emoji',
        ...commonState,
      });
      emojiIndex++;
    }
  });

  const footerElements = rootElement.querySelectorAll('[data-editable-type="footer"]');
  footerElements.forEach((footer) => {
    const element = footer as HTMLElement;
    const text = element.textContent?.trim() || '底部元素';
    const commonState = getCommonElementState(element);

    editableElements.push({
      id: element.getAttribute('data-editable-id') || `footer-${footerIndex}`,
      type: 'footer',
      text,
      placeholder: '编辑底部文字',
      ...commonState,
    });
    footerIndex++;
  });

  const decorationElements = rootElement.querySelectorAll('[data-editable-type="decoration"]');
  decorationElements.forEach((decoration) => {
    const element = decoration as HTMLElement;
    const text = element.getAttribute('data-editable-label') || element.textContent?.trim() || '装饰元素';
    const commonState = getCommonElementState(element);

    editableElements.push({
      id: element.getAttribute('data-editable-id') || `decoration-${decorationIndex}`,
      type: 'decoration',
      text,
      placeholder: '装饰元素',
      ...commonState,
    });
    decorationIndex++;
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
  let footerIndex = 0;
  let decorationIndex = 0;

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

  const explicitTags = rootElement.querySelectorAll('[data-editable-type="tag"]');
  explicitTags.forEach((tag) => {
    const element = tag as HTMLElement;
    if (!element.getAttribute('data-editable-id')) {
      element.setAttribute('data-editable-id', `tag-${tagIndex}`);
    }
    tagIndex++;
  });

  // 标记 AI 生成内容中的独立 span 标签。
  const tags = rootElement.querySelectorAll('span');
  tags.forEach((span) => {
    const text = span.textContent?.trim();
    if (
      text &&
      text.length < 30 &&
      text.length > 1 &&
      text === text.toUpperCase() &&
      !span.closest('[data-editable-type="tag"]')
    ) {
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

  const explicitFooterElements = rootElement.querySelectorAll('[data-editable-type="footer"]');
  explicitFooterElements.forEach((footer) => {
    const element = footer as HTMLElement;
    if (!element.getAttribute('data-editable-id')) {
      element.setAttribute('data-editable-id', `footer-${footerIndex}`);
    }
    footerIndex++;
  });

  const explicitDecorationElements = rootElement.querySelectorAll('[data-editable-type="decoration"]');
  explicitDecorationElements.forEach((decoration) => {
    const element = decoration as HTMLElement;
    if (!element.getAttribute('data-editable-id')) {
      element.setAttribute('data-editable-id', `decoration-${decorationIndex}`);
    }
    decorationIndex++;
  });

  const lastChild = rootElement.lastElementChild as HTMLElement | null;
  const lastChildText = lastChild?.textContent?.trim() || '';
  if (
    lastChild &&
    !lastChild.getAttribute('data-editable-id') &&
    !lastChild.querySelector('[data-editable-id]') &&
    !lastChild.getAttribute('data-bg-layer') &&
    !lastChild.getAttribute('data-overlay') &&
    lastChildText.length >= 2 &&
    lastChildText.length <= 40
  ) {
    lastChild.setAttribute('data-editable-id', `footer-${footerIndex}`);
    lastChild.setAttribute('data-editable-type', 'footer');
  }

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
