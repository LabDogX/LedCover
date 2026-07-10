import React, { useEffect, useState } from 'react';
import { Palette, Upload } from 'lucide-react';
import { BackgroundEdit } from '../types';
import { XHS_COLOR_PRESETS } from '../utils/presets';

interface BackgroundEditSectionProps {
  background: BackgroundEdit | null;
  onChange: (background: BackgroundEdit) => void;
}

type BgType = 'solid' | 'gradient' | 'image';

// 预设渐变选项
const GRADIENT_PRESETS = [
  { name: '紫色渐变', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: '粉色渐变', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: '蓝色渐变', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: '绿色渐变', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: '橙色渐变', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: '深蓝渐变', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
];

const BackgroundEditSection: React.FC<BackgroundEditSectionProps> = ({
  background,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<BgType>(
    background?.type || 'solid'
  );

  useEffect(() => {
    if (background?.type) {
      setActiveTab(background.type);
    }
  }, [background?.type]);

  const handleTypeChange = (type: BgType) => {
    setActiveTab(type);

    // 初始化对应类型的默认值
    switch (type) {
      case 'solid':
        onChange({ type: 'solid', value: '#0f172a' });
        break;
      case 'gradient':
        onChange({ type: 'gradient', value: GRADIENT_PRESETS[0].value });
        break;
      case 'image':
        onChange({
          type: 'image',
          value: '',
          blur: 0,
          imagePosition: { x: 0, y: 0 },
          imageScale: 100,
          overlayOpacity: 0,
          overlayColor: '#000000',
        });
        break;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onChange({
          type: 'image',
          value: ev.target?.result as string,
          blur: background?.type === 'image' ? background.blur : 0,
          imagePosition: background?.type === 'image' ? background.imagePosition : { x: 0, y: 0 },
          imageScale: background?.type === 'image' ? background.imageScale : 100,
          overlayOpacity: background?.type === 'image' ? background.overlayOpacity : 0,
          overlayColor: background?.type === 'image' ? background.overlayColor : '#000000',
        } as BackgroundEdit);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Palette className="w-4 h-4" />
        背景设置
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => handleTypeChange('solid')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'solid'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          纯色
        </button>
        <button
          onClick={() => handleTypeChange('gradient')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'gradient'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          渐变
        </button>
        <button
          onClick={() => handleTypeChange('image')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            activeTab === 'image'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          图片
        </button>
      </div>

      {/* 配色预设 */}
      <div className="grid grid-cols-4 gap-2">
        {XHS_COLOR_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onChange(preset.background)}
            className="h-10 rounded-lg border border-slate-200 shadow-sm hover:ring-2 hover:ring-indigo-400 transition-all"
            style={{ background: preset.background.value }}
            title={preset.name}
            aria-label={preset.name}
          />
        ))}
      </div>

      {/* 纯色编辑器 */}
      {activeTab === 'solid' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={background?.type === 'solid' ? background.value : '#0f172a'}
              onChange={(e) => onChange({ type: 'solid', value: e.target.value })}
              className="w-16 h-10 rounded-lg cursor-pointer border-2 border-slate-200"
            />
            <input
              type="text"
              value={background?.type === 'solid' ? background.value : '#0f172a'}
              onChange={(e) => onChange({ type: 'solid', value: e.target.value })}
              placeholder="#0f172a"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
      )}

      {/* 渐变编辑器 */}
      {activeTab === 'gradient' && (
        <div className="flex flex-col gap-3">
          <select
            value={background?.type === 'gradient' ? background.value : ''}
            onChange={(e) => onChange({ type: 'gradient', value: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            {GRADIENT_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={background?.type === 'gradient' ? background.value : ''}
            onChange={(e) => onChange({ type: 'gradient', value: e.target.value })}
            placeholder="linear-gradient(...)"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-600"
          />
        </div>
      )}

      {/* 图片编辑器 */}
      {activeTab === 'image' && (
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
            <span className="text-sm text-slate-600 group-hover:text-indigo-600">
              {background?.type === 'image' && background.value ? '更换图片' : '上传背景图片'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {background?.type === 'image' && background.value && (
            <div className="text-xs text-slate-500 text-center">
              已选择图片
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundEditSection;
