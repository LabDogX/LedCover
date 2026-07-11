import React from 'react';
import { Platform } from '../types';
import { Layout, Smartphone, Wand2, AlertTriangle } from 'lucide-react';

interface InputSectionProps {
  topic: string;
  setTopic: (topic: string) => void;
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  onGenerate: () => void;
  isLoading: boolean;
  usingCustomKey: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({
  topic,
  setTopic,
  platform,
  setPlatform,
  onGenerate,
  isLoading,
  usingCustomKey,
}) => {
  const charCount = topic.length;
  // Threshold for warning about length
  const MAX_FREE_CHARS = 800;
  const showWarningBox = !usingCustomKey || charCount > MAX_FREE_CHARS;
  // Always highlight count if long
  const isLong = charCount > MAX_FREE_CHARS;

  // Wrapper for generate to add haptic feedback
  const handleGenerate = () => {
    if (navigator.vibrate) {
        navigator.vibrate(15); // Light tap feedback
    }
    onGenerate();
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-sm md:shadow-xl p-4 md:p-8 flex flex-col gap-4 md:gap-6 h-full border border-slate-100 relative">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1.5 md:mb-2 flex items-center gap-2">
          <Wand2 className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          内容设置
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          输入您的文章主题或粘贴内容摘要，AI 将为您生成匹配的封面。
        </p>
      </div>

      {/* Platform Toggle */}
      <div className="grid grid-cols-2 gap-2 md:gap-3 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setPlatform(Platform.WeChat)}
          className={`flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 px-2 md:px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            platform === Platform.WeChat
              ? 'bg-white text-green-700 shadow-sm ring-1 ring-black/5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layout className="w-4 h-4" />
          微信公众号
        </button>
        <button
          onClick={() => setPlatform(Platform.Xiaohongshu)}
          className={`flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 px-2 md:px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            platform === Platform.Xiaohongshu
              ? 'bg-white text-rose-600 shadow-sm ring-1 ring-black/5'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          小红书
        </button>
      </div>

      {/* Text Input */}
      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-2">
           <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
             文章主题 / 标题
           </label>
           {/* Character Count */}
           <span className={`text-xs transition-colors ${isLong ? 'text-orange-500 font-bold' : 'text-slate-300'}`}>
             {charCount} 字
           </span>
        </div>
        
        <div className="relative flex-grow flex flex-col">
            <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：适合程序员的5个远程办公技巧..."
            className={`w-full flex-1 min-h-[220px] sm:min-h-[280px] lg:min-h-0 p-3 md:p-4 rounded-xl border ${isLong ? 'border-orange-300 focus:ring-orange-200' : 'border-slate-200 focus:ring-purple-500'} bg-slate-50 focus:bg-white focus:ring-2 focus:border-transparent outline-none resize-none text-slate-700 transition-all text-base leading-relaxed`}
            />
        </div>

        {/* Token Warning (Only for default key users) */}
        {showWarningBox && (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div className="text-xs text-orange-700 leading-relaxed">
                    <p className="font-bold">{usingCustomKey ? '内容较长' : '需要配置 API Key'}</p>
                    <p className="opacity-90 mt-0.5">
                        {usingCustomKey
                          ? '长文本可能导致生成失败，建议精简内容后再生成。'
                          : '纯前端部署不会内置 API Key。请在设置中配置您的 Key 后再使用 AI 生成。'}
                    </p>
                </div>
            </div>
        )}
      </div>

      {/* Mobile Spacer: Prevents content from being hidden behind the fixed button */}
      <div className="h-28 md:hidden shrink-0"></div>

      {/* Generate Button: Sticky Bottom on Mobile, Static on Desktop */}
      <div className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50 md:static md:bg-transparent md:p-0 md:border-0 md:z-auto transition-all">
        <div className="max-w-7xl mx-auto md:max-w-none w-full">
            <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className={`w-full py-3.5 md:py-4 rounded-xl font-bold text-white text-base md:text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                isLoading || !topic.trim()
                ? 'bg-slate-300 cursor-not-allowed'
                : platform === Platform.WeChat
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-200 hover:from-green-600 hover:to-emerald-700'
                : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:shadow-rose-200 hover:from-rose-600 hover:to-pink-700'
            }`}
            >
            {isLoading ? (
                <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                生成中...
                </>
            ) : (
                <>
                <Wand2 className="w-5 h-5" />
                生成封面
                </>
            )}
            </button>
        </div>
      </div>

    </div>
  );
};

export default InputSection;
