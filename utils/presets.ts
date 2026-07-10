import { ColorPreset } from '../types';

export const XHS_COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'ink-cream',
    name: '黑字奶油',
    background: { type: 'solid', value: '#fff7ed' },
  },
  {
    id: 'paper-red',
    name: '醒目红白',
    background: { type: 'solid', value: '#ffffff' },
  },
  {
    id: 'mint-pop',
    name: '薄荷撞色',
    background: { type: 'solid', value: '#d9f99d' },
  },
  {
    id: 'lemon-note',
    name: '柠檬便签',
    background: { type: 'solid', value: '#fef08a' },
  },
  {
    id: 'rose-card',
    name: '粉色卡片',
    background: { type: 'solid', value: '#fce7f3' },
  },
  {
    id: 'blue-gradient',
    name: '蓝粉渐变',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #dbeafe 0%, #fbcfe8 100%)',
    },
  },
  {
    id: 'sunset-gradient',
    name: '橙黄渐变',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #fed7aa 0%, #fef08a 100%)',
    },
  },
  {
    id: 'dark-contrast',
    name: '暗底高反差',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #020617 0%, #334155 100%)',
    },
  },
];

export const EMOJI_PRESETS = [
  '🔥',
  '✨',
  '💡',
  '📌',
  '🚀',
  '✅',
  '🎯',
  '📱',
  '💬',
  '⭐',
  '🧠',
  '📝',
];
