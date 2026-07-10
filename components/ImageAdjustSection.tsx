import React from 'react';
import { Sliders, Maximize, Crosshair, Droplet } from 'lucide-react';
import { BackgroundEdit } from '../types';

interface ImageAdjustSectionProps {
  background: BackgroundEdit | null;
  onChange: (background: BackgroundEdit) => void;
}

const ImageAdjustSection: React.FC<ImageAdjustSectionProps> = ({
  background,
  onChange,
}) => {
  // 仅在背景类型为图片时显示
  if (background?.type !== 'image' || !background.value) {
    return null;
  }

  const currentBg = background as BackgroundEdit & { type: 'image' };

  const updatePosition = (axis: 'x' | 'y', value: number) => {
    onChange({
      ...currentBg,
      imagePosition: {
        x: currentBg.imagePosition?.x ?? 0,
        y: currentBg.imagePosition?.y ?? 0,
        [axis]: value,
      },
    });
  };

  const updateScale = (value: number) => {
    onChange({ ...currentBg, imageScale: value });
  };

  const updateBlur = (value: number) => {
    onChange({ ...currentBg, blur: value });
  };

  const updateOverlay = (opacity: number, color?: string) => {
    onChange({
      ...currentBg,
      overlayOpacity: opacity,
      ...(color && { overlayColor: color }),
    });
  };

  return (
    <div className="flex flex-col gap-4 pt-4 border-t border-slate-200">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Sliders className="w-4 h-4" />
        图片调整
      </div>

      <div className="flex flex-col gap-4">
        {/* 位置调整 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Crosshair className="w-3.5 h-3.5" />
              位置
            </div>
            <span className="text-xs text-slate-500 font-mono">
              X: {currentBg.imagePosition?.x || 0}%, Y: {currentBg.imagePosition?.y || 0}%
            </span>
          </div>

          {/* X 轴位置 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-3">L</span>
            <input
              type="range"
              min="-100"
              max="100"
              value={currentBg.imagePosition?.x || 0}
              onChange={(e) => updatePosition('x', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-slate-400 w-3 text-right">R</span>
          </div>

          {/* Y 轴位置 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-3">T</span>
            <input
              type="range"
              min="-100"
              max="100"
              value={currentBg.imagePosition?.y || 0}
              onChange={(e) => updatePosition('y', parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-slate-400 w-3 text-right">B</span>
          </div>
        </div>

        {/* 缩放调整 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Maximize className="w-3.5 h-3.5" />
              缩放
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {currentBg.imageScale || 100}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">50%</span>
            <input
              type="range"
              min="50"
              max="200"
              value={currentBg.imageScale || 100}
              onChange={(e) => updateScale(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-slate-400">200%</span>
          </div>
        </div>

        {/* 模糊度调整 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Sliders className="w-3.5 h-3.5" />
              模糊度
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {currentBg.blur || 0}px
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">0</span>
            <input
              type="range"
              min="0"
              max="20"
              value={currentBg.blur || 0}
              onChange={(e) => updateBlur(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-slate-400">20px</span>
          </div>
        </div>

        {/* 遮罩层调整 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Droplet className="w-3.5 h-3.5" />
              遮罩层
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {currentBg.overlayOpacity || 0}%
            </span>
          </div>

          {/* 透明度滑块 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">0%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={currentBg.overlayOpacity || 0}
              onChange={(e) => updateOverlay(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-slate-400">100%</span>
          </div>

          {/* 颜色选择器 */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentBg.overlayColor || '#000000'}
              onChange={(e) => updateOverlay(currentBg.overlayOpacity || 0, e.target.value)}
              className="w-10 h-8 rounded cursor-pointer border border-slate-200"
            />
            <input
              type="text"
              value={currentBg.overlayColor || '#000000'}
              onChange={(e) => updateOverlay(currentBg.overlayOpacity || 0, e.target.value)}
              className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAdjustSection;
