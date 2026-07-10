import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Upload } from 'lucide-react';
import { EditableElement } from '../types';
import { EMOJI_PRESETS } from '../utils/presets';
import { FONT_OPTIONS, FontOption, loadFontOption } from '../utils/fonts';

interface TextEditSectionProps {
  elements: EditableElement[];
  onChange: (
    elementId: string,
    newText: string,
    color?: string,
    align?: 'left' | 'center' | 'right',
    fontFamily?: string
  ) => void;
}

interface UploadedFontOption extends FontOption {
  objectUrl: string;
}

const TextEditSection: React.FC<TextEditSectionProps> = ({ elements, onChange }) => {
  const [uploadedFonts, setUploadedFonts] = useState<UploadedFontOption[]>([]);
  const uploadedFontUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      uploadedFontUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const fontOptions = useMemo<FontOption[]>(
    () => [...FONT_OPTIONS, ...uploadedFonts],
    [uploadedFonts]
  );

  if (elements.length === 0) {
    return (
      <div className="text-center text-slate-400 py-6 text-sm">
        未检测到可编辑的文字
      </div>
    );
  }

  const getElementTypeLabel = (type: EditableElement['type']): string => {
    switch (type) {
      case 'title':
        return '标题';
      case 'subtitle':
        return '副标题';
      case 'tag':
        return '标签';
      case 'emoji':
        return 'Emoji';
      default:
        return '文字';
    }
  };

  const handleColorChange = (elementId: string, newText: string, color: string) => {
    const element = elements.find(el => el.id === elementId);
    onChange(elementId, newText, color, element?.align, element?.fontFamily);
  };

  const handleAlignChange = (elementId: string, align: 'left' | 'center' | 'right') => {
    const element = elements.find(el => el.id === elementId);
    // 只有当对齐方式真正改变时才触发更新
    if (element?.align !== align) {
      onChange(elementId, element?.text || '', element?.color, align, element?.fontFamily);
    }
  };

  const handleFontChange = async (element: EditableElement, fontFamily: string) => {
    const selectedFont = fontOptions.find((font) => font.cssFamily === fontFamily);

    if (selectedFont) {
      try {
        await loadFontOption(selectedFont);
      } catch (error) {
        const message = error instanceof Error ? error.message : '浏览器无法解析该字体文件';
        alert(`字体加载失败：${selectedFont.label}\n${message}`);
        return;
      }
    }

    onChange(element.id, element.text, element.color, element.align, fontFamily);
  };

  const handleEmojiClick = (element: EditableElement, emoji: string) => {
    const nextText = element.type === 'emoji' ? emoji : `${element.text}${emoji}`;
    onChange(element.id, nextText, element.color, element.align, element.fontFamily);
  };

  const getFontOptionsForElement = (element: EditableElement): FontOption[] => {
    if (!element.fontFamily || fontOptions.some((font) => font.cssFamily === element.fontFamily)) {
      return fontOptions;
    }

    return [
      {
        id: `${element.id}-current-font`,
        label: '当前模板字体',
        cssFamily: element.fontFamily,
      },
      ...fontOptions,
    ];
  };

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const loadedFonts: UploadedFontOption[] = [];

    for (const file of files) {
      const objectUrl = URL.createObjectURL(file);
      const baseName = file.name.replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, '');
      const safeName = baseName.replace(/[^\w\u4e00-\u9fa5-]+/g, ' ').trim() || 'Custom Font';
      const family = `LedCover ${safeName} ${file.lastModified}`;

      try {
        const fontFace = new FontFace(family, `url("${objectUrl}")`);
        await fontFace.load();
        document.fonts.add(fontFace);

        loadedFonts.push({
          id: `uploaded-${file.name}-${file.lastModified}`,
          label: safeName,
          cssFamily: `"${family}", "PingFang SC", "Microsoft YaHei", sans-serif`,
          objectUrl,
        });
        uploadedFontUrlsRef.current.push(objectUrl);
      } catch {
        URL.revokeObjectURL(objectUrl);
        alert(`字体加载失败：${file.name}`);
      }
    }

    if (loadedFonts.length > 0) {
      setUploadedFonts((prev) => [...prev, ...loadedFonts]);
    }

    event.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Type className="w-4 h-4" />
          文字内容
        </div>
        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
          <Upload className="w-3.5 h-3.5" />
          上传字体
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
            multiple
            className="hidden"
            onChange={handleFontUpload}
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
        {elements.map((element) => (
          <div key={element.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {getElementTypeLabel(element.type)}
            </label>

            {/* 文字输入 */}
            <input
              type="text"
              value={element.text}
              onChange={(e) => onChange(element.id, e.target.value, element.color, element.align, element.fontFamily)}
              placeholder={element.placeholder}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm placeholder:text-slate-400"
              style={{ fontFamily: element.fontFamily || undefined }}
            />

            {/* Emoji 快捷插入 */}
            <div className="grid grid-cols-6 gap-1.5">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={`${element.id}-${emoji}`}
                  onClick={() => handleEmojiClick(element, emoji)}
                  className={`h-8 rounded-md border border-slate-200 bg-white text-base hover:bg-indigo-50 hover:border-indigo-300 transition-colors ${
                    element.type === 'emoji' && element.text === emoji ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  title={element.type === 'emoji' ? `替换为 ${emoji}` : `插入 ${emoji}`}
                  aria-label={element.type === 'emoji' ? `替换为 ${emoji}` : `插入 ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {element.type !== 'emoji' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 shrink-0">字体:</label>
                <select
                  value={element.fontFamily || ''}
                  onChange={(e) => handleFontChange(element, e.target.value)}
                  className="min-w-0 flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  style={{ fontFamily: element.fontFamily || undefined }}
                >
                  <option value="">模板默认</option>
                  {getFontOptionsForElement(element).map((font) => (
                    <option
                      key={`${element.id}-${font.id}`}
                      value={font.cssFamily}
                      style={{ fontFamily: font.cssFamily }}
                    >
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 颜色和对齐控制 */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 颜色选择器 */}
              <div className="flex items-center gap-2 flex-1">
                <label className="text-xs text-slate-500">颜色:</label>
                <input
                  type="color"
                  value={element.color || '#000000'}
                  onChange={(e) => handleColorChange(element.id, element.text, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={element.color || ''}
                  onChange={(e) => handleColorChange(element.id, element.text, e.target.value)}
                  placeholder="#000000"
                  className="w-20 px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* 对齐按钮 */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleAlignChange(element.id, 'left')}
                  className={`p-1.5 rounded transition-colors ${
                    element.align === 'left'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title="左对齐"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAlignChange(element.id, 'center')}
                  className={`p-1.5 rounded transition-colors ${
                    element.align === 'center'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title="居中对齐"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAlignChange(element.id, 'right')}
                  className={`p-1.5 rounded transition-colors ${
                    element.align === 'right'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title="右对齐"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TextEditSection;
