import { BackgroundEdit } from '../types';

export interface TextModification {
  elementId: string;
  newText: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontSize?: number;
}

export interface ElementModification {
  elementId: string;
  visible?: boolean;
  position?: { x: number; y: number };
}

export interface ModificationOptions {
  text?: TextModification[];
  element?: ElementModification[];
  background?: BackgroundEdit;
}

/**
 * 修改 HTML 内容
 * @param originalHtml 原始 HTML 字符串
 * @param modifications 修改选项
 * @returns 修改后的 HTML 字符串
 */
export function modifyHtml(
  originalHtml: string,
  modifications: ModificationOptions
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(originalHtml, 'text/html');
  const rootElement = doc.body.firstElementChild as HTMLElement;

  if (!rootElement) return originalHtml;

  // 修改文字内容
  if (modifications.text) {
    modifications.text.forEach(mod => {
      const element = rootElement.querySelector(`[data-editable-id="${mod.elementId}"]`);
      if (element) {
        const htmlElement = element as HTMLElement;

        // 先应用样式（在修改文本内容之前）
        if (mod.color) {
          htmlElement.style.color = mod.color;
        }
        if (mod.align) {
          // 移除可能存在的旧内联样式
          htmlElement.style.removeProperty('text-align');
          // 设置新的内联样式
          htmlElement.style.setProperty('text-align', mod.align, 'important');
        }
        if (mod.fontFamily !== undefined) {
          if (mod.fontFamily) {
            htmlElement.style.fontFamily = mod.fontFamily;
          } else {
            htmlElement.style.removeProperty('font-family');
          }
        }
        if (mod.fontSize !== undefined && Number.isFinite(mod.fontSize) && mod.fontSize > 0) {
          htmlElement.style.fontSize = `${Math.round(mod.fontSize)}px`;
        }

        // 然后修改文本内容
        element.textContent = mod.newText;
      }
    });
  }

  if (modifications.element) {
    modifications.element.forEach(mod => {
      applyElementState(rootElement, mod);
    });
  }

  // 修改背景
  if (modifications.background) {
    applyBackground(rootElement, modifications.background);
  }

  return rootElement.outerHTML;
}

function applyElementState(rootElement: HTMLElement, mod: ElementModification): void {
  const element = rootElement.querySelector(`[data-editable-id="${mod.elementId}"]`) as HTMLElement | null;
  if (!element) return;

  if (mod.visible !== undefined) {
    if (mod.visible) {
      element.setAttribute('data-hidden', 'false');
      const storedDisplay = element.getAttribute('data-ledcover-display');
      if (storedDisplay) {
        element.style.display = storedDisplay;
        element.removeAttribute('data-ledcover-display');
      } else {
        element.style.removeProperty('display');
      }
    } else {
      const currentDisplay = element.style.display;
      if (currentDisplay && currentDisplay !== 'none') {
        element.setAttribute('data-ledcover-display', currentDisplay);
      }
      element.setAttribute('data-hidden', 'true');
      element.style.display = 'none';
    }
  }

  if (mod.position) {
    if (element.parentElement !== rootElement) {
      rootElement.appendChild(element);
    }

    element.setAttribute('data-position-x', String(Math.round(mod.position.x)));
    element.setAttribute('data-position-y', String(Math.round(mod.position.y)));
    element.setAttribute('data-layout', 'free');
    element.style.position = 'absolute';
    element.style.left = `${Math.round(mod.position.x)}px`;
    element.style.top = `${Math.round(mod.position.y)}px`;
    element.style.right = '';
    element.style.bottom = '';
    element.style.margin = '0';
    element.style.zIndex = element.style.zIndex || '30';
    element.style.touchAction = 'none';
    element.style.cursor = 'grab';
  }
}

/**
 * 应用背景样式到元素
 */
function applyBackground(element: HTMLElement, bg: BackgroundEdit): void {
  // 移除旧的背景层（如果存在）
  const oldBgLayer = element.querySelector('[data-bg-layer="true"]');
  if (oldBgLayer) {
    oldBgLayer.remove();
  }

  // 移除旧的遮罩层
  removeOverlay(element);

  // 重置元素样式
  element.style.background = '';
  element.style.backgroundImage = '';
  element.style.filter = '';

  if (bg.type === 'image') {
    // 创建一个单独的背景层来承载图片和模糊效果
    const bgLayer = document.createElement('div');
    bgLayer.setAttribute('data-bg-layer', 'true');
    bgLayer.style.cssText = `
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    `;

    // 设置背景图片
    bgLayer.style.backgroundImage = `url("${bg.value}")`;
    bgLayer.style.backgroundRepeat = 'no-repeat';

    // 应用缩放
    const scale = bg.imageScale || 100;
    bgLayer.style.backgroundSize = `${scale}%`;

    // 应用位置
    const xPos = 50 + (bg.imagePosition?.x || 0);
    const yPos = 50 + (bg.imagePosition?.y || 0);
    bgLayer.style.backgroundPosition = `${xPos}% ${yPos}%`;

    // 应用模糊（只影响背景层）
    if (bg.blur && bg.blur > 0) {
      bgLayer.style.filter = `blur(${bg.blur}px)`;
    }

    // 插入背景层作为第一个子元素
    element.insertBefore(bgLayer, element.firstChild);

    // 应用遮罩层
    applyOverlay(element, bg);
  } else {
    // 纯色或渐变 - 直接应用到元素
    element.style.background = bg.value;
  }
}

/**
 * 应用遮罩层到元素
 */
function applyOverlay(element: HTMLElement, bg: BackgroundEdit): void {
  const opacity = bg.overlayOpacity || 0;
  const color = bg.overlayColor || '#000000';

  // 移除旧的遮罩层
  removeOverlay(element);

  if (opacity > 0) {
    // 查找或创建遮罩层
    let overlay = element.querySelector('[data-overlay="true"]') as HTMLElement;

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.setAttribute('data-overlay', 'true');
      overlay.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1;
      `;
      element.appendChild(overlay);
    }

    // 将 rgba 颜色转换为十六进制格式
    const hexColor = color.replace('#', '');
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    const rgba = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;

    overlay.style.background = rgba;
  }
}

/**
 * 移除遮罩层
 */
function removeOverlay(element: HTMLElement): void {
  const overlay = element.querySelector('[data-overlay="true"]');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * 预加载图片
 * @param url 图片 URL（支持 dataURL）
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // dataURL 不需要预加载
    if (url.startsWith('data:')) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = url;
  });
}
