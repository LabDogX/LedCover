import React, { useEffect, useState } from 'react';
import { Settings, X, CheckCircle2, KeyRound } from 'lucide-react';
import { AIProvider, AppSettings } from '../types';
import { applyProviderDefaults, getProviderOption, PROVIDER_OPTIONS } from '../utils/aiProviders';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showSuccess, setShowSuccess] = useState(false);
  const selectedProvider = getProviderOption(localSettings.provider);

  // Sync prop changes to local state
  useEffect(() => {
    setLocalSettings(applyProviderDefaults(settings));
  }, [settings, isOpen]);

  const handleSave = () => {
    onSave(applyProviderDefaults(localSettings));
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1000);
  };

  const handleProviderChange = (provider: AIProvider) => {
    const nextProvider = getProviderOption(provider);
    setLocalSettings({
      ...localSettings,
      provider,
      model: nextProvider.defaultModel,
      baseUrl: nextProvider.defaultBaseUrl || '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            系统设置
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">
              AI 模型提供商
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROVIDER_OPTIONS.map((option) => (
                <button
                  key={option.provider}
                  onClick={() => handleProviderChange(option.provider)}
                  className={`flex flex-col items-start justify-center p-3 rounded-xl border-2 transition-all text-left ${
                    localSettings.provider === option.provider
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-100 hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="font-bold text-sm">{option.label}</span>
                  <span className="text-[10px] opacity-70 mt-1 leading-snug">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Input */}
          <div className="space-y-3">
             <label className="text-sm font-semibold text-slate-700 block">
                模型名称
             </label>
             <input
                type="text"
                value={localSettings.model || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                placeholder={selectedProvider.defaultModel}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-mono text-slate-600 placeholder:text-slate-300"
             />
          </div>

          {/* Base URL Input */}
          {selectedProvider.isOpenAICompatible && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 block">
                Base URL
              </label>
              <input
                type="text"
                value={localSettings.baseUrl || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, baseUrl: e.target.value })}
                placeholder={selectedProvider.defaultBaseUrl || 'https://example.com/v1'}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-mono text-slate-600 placeholder:text-slate-300"
              />
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-3">
             <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-400" />
                API Key <span className="text-slate-400 font-normal text-xs">
                  {selectedProvider.requiresApiKey ? '(必填，仅保存在当前浏览器)' : '(可选，仅保存在当前浏览器)'}
                </span>
             </label>
             <input
                type="password"
                value={localSettings.apiKey || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                placeholder={selectedProvider.apiKeyPlaceholder}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-mono text-slate-600 placeholder:text-slate-300"
             />
             <div className="text-xs text-slate-400 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p>💡 <strong>提示：</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>纯前端部署不会把 API Key 写入构建产物。</li>
                    <li>OpenAI、DeepSeek、Gemini 需要填入自己的 Key；本地 LM Studio/Ollama 通常可留空。</li>
                    <li>本地接口需要在 LM Studio/Ollama 侧允许浏览器跨域访问。</li>
                    <li>Key 仅存储在本地浏览器，不会上传到应用服务器。</li>
                </ul>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all transform active:scale-95 ${
              showSuccess ? 'bg-green-500' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {showSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                已保存
              </>
            ) : (
              "保存设置"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
