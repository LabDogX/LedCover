export enum Platform {
  WeChat = 'WECHAT',
  Xiaohongshu = 'XHS'
}

export enum AIProvider {
  Gemini = 'GEMINI',
  DeepSeek = 'DEEPSEEK',
  OpenAI = 'OPENAI',
  LMStudio = 'LM_STUDIO',
  Ollama = 'OLLAMA',
  OpenAICompatible = 'OPENAI_COMPATIBLE'
}

export interface AppSettings {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  deepseekBaseUrl?: string; // Legacy setting kept for older localStorage values
}

export interface GeneratedCover {
  html: string;
  platform: Platform;
  timestamp: number;
}

export interface GenerationConfig {
  topic: string;
  platform: Platform;
}

// 编辑功能相关类型
export interface EditableElement {
  id: string;
  type: 'title' | 'subtitle' | 'tag' | 'emoji' | 'footer' | 'decoration';
  text: string;
  placeholder?: string;
  // 新增：字体颜色和文字对齐
  color?: string;
  align?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontSize?: number;
  visible?: boolean;
  position?: { x: number; y: number };
}

export interface BackgroundEdit {
  type: 'solid' | 'gradient' | 'image';
  value: string;
  blur?: number;
  // 图片调整参数
  imagePosition?: { x: number; y: number };
  imageScale?: number;
  overlayOpacity?: number;
  overlayColor?: string;
}

export interface EditState {
  isEditing: boolean;
  editableElements: EditableElement[];
  background: BackgroundEdit | null;
  modifiedHtml: string | null;
  originalHtml: string;
}

export type CoverTemplateId =
  | 'wechat-default'
  | 'xhs-bold-title'
  | 'xhs-clean-solid'
  | 'xhs-soft-gradient';

export interface CoverTemplate {
  id: CoverTemplateId;
  platform: Platform;
  name: string;
  description: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  platform: Platform;
  html: string;
  createdAt: number;
  updatedAt: number;
}
