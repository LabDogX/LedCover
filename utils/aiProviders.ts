import { AIProvider, AppSettings } from '../types';

export interface ProviderOption {
  provider: AIProvider;
  label: string;
  description: string;
  defaultModel: string;
  defaultBaseUrl?: string;
  apiKeyPlaceholder: string;
  requiresApiKey: boolean;
  isOpenAICompatible: boolean;
}

export const PROVIDER_OPTIONS: ProviderOption[] = [
  {
    provider: AIProvider.DeepSeek,
    label: 'DeepSeek',
    description: '中文友好 / OpenAI 兼容',
    defaultModel: 'deepseek-chat',
    defaultBaseUrl: 'https://api.deepseek.com',
    apiKeyPlaceholder: 'sk-...',
    requiresApiKey: true,
    isOpenAICompatible: true,
  },
  {
    provider: AIProvider.Gemini,
    label: 'Google Gemini',
    description: 'Google GenAI 接口',
    defaultModel: 'gemini-3-flash-preview',
    apiKeyPlaceholder: 'AIza...',
    requiresApiKey: true,
    isOpenAICompatible: false,
  },
  {
    provider: AIProvider.OpenAI,
    label: 'OpenAI',
    description: '官方 OpenAI API',
    defaultModel: 'gpt-5.6-terra',
    defaultBaseUrl: 'https://api.openai.com/v1',
    apiKeyPlaceholder: 'sk-...',
    requiresApiKey: true,
    isOpenAICompatible: true,
  },
  {
    provider: AIProvider.LMStudio,
    label: 'LM Studio',
    description: '本地 OpenAI 兼容接口',
    defaultModel: 'local-model',
    defaultBaseUrl: 'http://localhost:1234/v1',
    apiKeyPlaceholder: '可留空',
    requiresApiKey: false,
    isOpenAICompatible: true,
  },
  {
    provider: AIProvider.Ollama,
    label: 'Ollama',
    description: '本地 OpenAI 兼容接口',
    defaultModel: 'qwen2.5:7b',
    defaultBaseUrl: 'http://localhost:11434/v1',
    apiKeyPlaceholder: '可留空',
    requiresApiKey: false,
    isOpenAICompatible: true,
  },
  {
    provider: AIProvider.OpenAICompatible,
    label: '自定义兼容',
    description: 'OpenAI-compatible endpoint',
    defaultModel: 'model-name',
    defaultBaseUrl: '',
    apiKeyPlaceholder: '按服务要求填写，可留空',
    requiresApiKey: false,
    isOpenAICompatible: true,
  },
];

export function getProviderOption(provider: AIProvider): ProviderOption {
  return PROVIDER_OPTIONS.find(option => option.provider === provider) || PROVIDER_OPTIONS[0];
}

export function applyProviderDefaults(settings: AppSettings, provider = settings.provider): AppSettings {
  const option = getProviderOption(provider);

  return {
    ...settings,
    provider,
    model: settings.model || option.defaultModel,
    baseUrl: settings.baseUrl || settings.deepseekBaseUrl || option.defaultBaseUrl || '',
  };
}

export function getProviderDisplayName(settings: AppSettings): string {
  const option = getProviderOption(settings.provider);
  return settings.model ? `${option.label} · ${settings.model}` : option.label;
}
