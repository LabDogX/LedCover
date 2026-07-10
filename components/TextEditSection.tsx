import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { EditableElement } from '../types';
import { EMOJI_PRESETS } from '../utils/presets';

interface TextEditSectionProps {
  elements: EditableElement[];
  onChange: (elementId: string, newText: string, color?: string, align?: 'left' | 'center' | 'right') => void;
}

const TextEditSection: React.FC<TextEditSectionProps> = ({ elements, onChange }) => {
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
    onChange(elementId, newText, color, element?.align);
  };

  const handleAlignChange = (elementId: string, align: 'left' | 'center' | 'right') => {
    const element = elements.find(el => el.id === elementId);
    // 只有当对齐方式真正改变时才触发更新
    if (element?.align !== align) {
      onChange(elementId, element?.text || '', element?.color, align);
    }
  };

  const handleEmojiClick = (element: EditableElement, emoji: string) => {
    const nextText = element.type === 'emoji' ? emoji : `${element.text}${emoji}`;
    onChange(element.id, nextText, element.color, element.align);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Type className="w-4 h-4" />
        文字内容
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
              onChange={(e) => onChange(element.id, e.target.value, element.color, element.align)}
              placeholder={element.placeholder}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm placeholder:text-slate-400"
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
