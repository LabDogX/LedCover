import React, { useState, useEffect } from 'react';
import { Platform, AIProvider, AppSettings, EditableElement, BackgroundEdit, CoverTemplateId } from './types';
import { generateCoverHtml } from './services/llmService';
import { markEditableElements, parseHtmlForEditing } from './utils/htmlParser';
import { modifyHtml } from './utils/htmlModifier';
import { generateInitialTemplate, getDefaultTemplateId } from './utils/templateGenerator';
import InputSection from './components/InputSection';
import PreviewSection from './components/PreviewSection';
import EditPanel from './components/EditPanel';
import SettingsModal from './components/SettingsModal';
import Logo from './components/Logo';
import { Github, Settings as SettingsIcon, ChevronLeft, Sparkles } from 'lucide-react';
import { applyProviderDefaults, getProviderDisplayName, getProviderOption } from './utils/aiProviders';

const DEFAULT_SETTINGS: AppSettings = applyProviderDefaults({
  provider: AIProvider.DeepSeek,
  apiKey: '',
});

// Helper to reliably get URL parameters from search or hash
const getUrlParam = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  // 1. Check standard search params (?title=...)
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has(key)) return searchParams.get(key);
  
  // 2. Check hash params (often used in hash routers /#/?title=...)
  if (window.location.hash.includes('?')) {
    const hashPart = window.location.hash.split('?')[1];
    const hashParams = new URLSearchParams(hashPart);
    if (hashParams.has(key)) return hashParams.get(key);
  }
  
  return null;
};

const App: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>(Platform.WeChat);
  const [selectedTemplateId, setSelectedTemplateId] = useState<CoverTemplateId>(
    getDefaultTemplateId(Platform.WeChat)
  );
  
  // Initialize topic directly from URL
  const [topic, setTopic] = useState<string>(() => {
    const initialTitle = getUrlParam('title');
    return initialTitle ? decodeURIComponent(initialTitle) : '';
  });

  // Double-check URL params on mount to handle any router/async delays
  useEffect(() => {
    const title = getUrlParam('title');
    if (title && !topic) {
       setTopic(decodeURIComponent(title));
    }
  }, []);

  // 当前显示的 HTML（用于预览和编辑）
  const [currentHtml, setCurrentHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 编辑状态（始终可用）
  const [editableElements, setEditableElements] = useState<EditableElement[]>([]);
  const [background, setBackground] = useState<BackgroundEdit>({
    type: 'solid',
    value: '#0f172a',
  });

  // Mobile Preview Modal State
  const [showMobilePreview, setShowMobilePreview] = useState<boolean>(false);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Load settings from local storage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('led_cover_settings') || localStorage.getItem('gudong_cover_settings');
    if (savedSettings) {
      try {
        setSettings(applyProviderDefaults(JSON.parse(savedSettings)));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('led_cover_settings', JSON.stringify(newSettings));
  };

  // 初始化：生成默认模板
  useEffect(() => {
    const initialTemplate = generateInitialTemplate(platform, selectedTemplateId);
    const markedTemplate = markEditableElements(initialTemplate);
    setCurrentHtml(markedTemplate);

    const parsed = parseHtmlForEditing(markedTemplate);
    setEditableElements(parsed.editableElements);
    setBackground(parsed.background || { type: 'solid', value: '#0f172a' });
  }, []);

  // 当平台切换时，重新生成模板
  useEffect(() => {
    if (!currentHtml) return;
    const nextTemplateId = getDefaultTemplateId(platform);
    setSelectedTemplateId(nextTemplateId);

    const newTemplate = generateInitialTemplate(platform, nextTemplateId);
    const markedTemplate = markEditableElements(newTemplate);
    setCurrentHtml(markedTemplate);

    const parsed = parseHtmlForEditing(markedTemplate);
    setEditableElements(parsed.editableElements);
    setBackground(parsed.background || { type: 'solid', value: '#0f172a' });
  }, [platform]);

  // 模板切换
  const handleTemplateChange = (templateId: CoverTemplateId) => {
    setSelectedTemplateId(templateId);

    const newTemplate = generateInitialTemplate(platform, templateId);
    const markedTemplate = markEditableElements(newTemplate);
    setCurrentHtml(markedTemplate);

    const parsed = parseHtmlForEditing(markedTemplate);
    setEditableElements(parsed.editableElements);
    setBackground(parsed.background || { type: 'solid', value: '#0f172a' });
  };

  // 文字修改
  const handleTextChange = (
    elementId: string,
    newText: string,
    color?: string,
    align?: 'left' | 'center' | 'right',
    fontFamily?: string
  ) => {
    if (!currentHtml) return;

    // 更新 HTML
    const newHtml = modifyHtml(currentHtml, {
      text: [{ elementId, newText, color, align, fontFamily }],
    });
    setCurrentHtml(newHtml);

    // 同时更新 editableElements 状态
    setEditableElements(prev =>
      prev.map(el =>
        el.id === elementId
          ? { ...el, text: newText, color, align, fontFamily }
          : el
      )
    );
  };

  // 背景修改
  const handleBackgroundChange = (newBackground: BackgroundEdit) => {
    if (!currentHtml) return;
    const newHtml = modifyHtml(currentHtml, { background: newBackground });
    setCurrentHtml(newHtml);
    setBackground(newBackground);
  };

  const handleElementVisibilityChange = (elementId: string, visible: boolean) => {
    if (!currentHtml) return;
    const newHtml = modifyHtml(currentHtml, {
      element: [{ elementId, visible }],
    });
    setCurrentHtml(newHtml);
    setEditableElements(prev =>
      prev.map(el =>
        el.id === elementId
          ? { ...el, visible }
          : el
      )
    );
  };

  const handleElementPositionChange = (elementId: string, position: { x: number; y: number }) => {
    if (!currentHtml) return;
    const newHtml = modifyHtml(currentHtml, {
      element: [{ elementId, position }],
    });
    setCurrentHtml(newHtml);
    setEditableElements(prev =>
      prev.map(el =>
        el.id === elementId
          ? { ...el, position }
          : el
      )
    );
  };

  // 重置到初始模板
  const handleReset = () => {
    const initialTemplate = generateInitialTemplate(platform, selectedTemplateId);
    const markedTemplate = markEditableElements(initialTemplate);
    setCurrentHtml(markedTemplate);

    const parsed = parseHtmlForEditing(markedTemplate);
    setEditableElements(parsed.editableElements);
    setBackground(parsed.background || { type: 'solid', value: '#0f172a' });
  };

  // 直接从编辑状态生成（不使用 AI）
  const handleGenerateFromEdit = () => {
    // 当前的 currentHtml 已经是用户编辑后的内容
    if (navigator.vibrate) navigator.vibrate([30]);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    // Open mobile preview modal immediately so user sees the loading state
    if (window.innerWidth < 1024) {
        setShowMobilePreview(true);
    }

    setIsLoading(true);

    try {
      const html = await generateCoverHtml(topic, platform, settings);

      // Mark editable elements for later editing
      const markedHtml = markEditableElements(html);
      setCurrentHtml(markedHtml);

      // Parse for editing
      const parsed = parseHtmlForEditing(markedHtml);
      setEditableElements(parsed.editableElements);
      setBackground(parsed.background || { type: 'solid', value: '#0f172a' });

      // Success haptic
      if (navigator.vibrate) navigator.vibrate([50]);

    } catch (error: any) {
      console.error(error);
      alert(error.message || "生成封面时出错，请检查 API Key 设置。");
      // Close mobile preview on error so user can edit
      setShowMobilePreview(false);

      // If error might be due to missing key, open settings
      if (error.message && (error.message.includes("API Key") || error.message.includes("401"))) {
         setIsSettingsOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="w-8 h-8" withText={true} />
            
            {/* Tagline / Slogan - Desktop Only */}
            <div className="hidden md:flex items-center gap-4">
               {/* Vertical Divider */}
               <div className="w-[1px] h-4 bg-slate-200"></div>
               {/* Slogan Text */}
               <span className="text-sm font-medium text-slate-500 tracking-tight">
                 专注写作，门面交给 AI
               </span>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
             {/* Github Link */}
             <a 
              href="https://github.com/LabDogX/LedCover" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              title="View Source on GitHub"
            >
              <Github className="w-5 h-5" />
            </a>

             {/* Settings Button */}
             <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative group"
              title="设置 API Key"
            >
              <SettingsIcon className="w-5 h-5" />
              {(settings.apiKey || !getProviderOption(settings.provider).requiresApiKey) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Model Indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs font-medium bg-slate-100 px-3 py-1.5 rounded-full text-slate-500 border border-slate-200 ml-2">
              <span>Model:</span>
              <span className="text-indigo-600 font-bold">
                {getProviderDisplayName(settings)}
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[95%] mx-auto py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-6 lg:h-[calc(100vh-160px)] min-h-[600px]">

          {/* Left: Input Section (2 cols) */}
          <div className="lg:col-span-3 h-full">
            <InputSection
              topic={topic}
              setTopic={setTopic}
              platform={platform}
              setPlatform={setPlatform}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              usingCustomKey={!!settings.apiKey || !getProviderOption(settings.provider).requiresApiKey}
            />
          </div>

          {/* Center: Preview Section (5 cols) */}
          <div className="lg:col-span-5 h-full">
            <PreviewSection
              html={currentHtml}
              platform={platform}
              isLoading={isLoading}
              editableElements={editableElements}
              onElementPositionChange={handleElementPositionChange}
              onElementVisibilityChange={handleElementVisibilityChange}
            />
          </div>

          {/* Right: Edit Panel (5 cols, always visible) */}
          <div className="hidden lg:block lg:col-span-4 h-full">
            <EditPanel
              platform={platform}
              selectedTemplateId={selectedTemplateId}
              editableElements={editableElements}
              background={background}
              onTemplateChange={handleTemplateChange}
              onTextChange={handleTextChange}
              onElementVisibilityChange={handleElementVisibilityChange}
              onBackgroundChange={handleBackgroundChange}
              onReset={handleReset}
            />
          </div>
        </div>
      </main>

      {/* Mobile Edit Modal */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col lg:hidden animate-in slide-in-from-bottom-10 duration-200">
           {/* Modal Header */}
           <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm border-b border-slate-200 shrink-0">
              <button
                onClick={() => setShowMobilePreview(false)}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                返回
              </button>
              <span className="font-bold text-slate-800">编辑封面</span>
              <div className="w-8"></div>
           </div>

           {/* Modal Content */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <PreviewSection
                  html={currentHtml}
                  platform={platform}
                  isLoading={isLoading}
                  editableElements={editableElements}
                  onElementPositionChange={handleElementPositionChange}
                  onElementVisibilityChange={handleElementVisibilityChange}
                  compact
              />
              <EditPanel
                platform={platform}
                selectedTemplateId={selectedTemplateId}
                editableElements={editableElements}
                background={background}
                onTemplateChange={handleTemplateChange}
                onTextChange={handleTextChange}
                onElementVisibilityChange={handleElementVisibilityChange}
                onBackgroundChange={handleBackgroundChange}
                onReset={handleReset}
                onClose={() => setShowMobilePreview(false)}
              />
           </div>
        </div>
      )}

      {/* Mobile Edit Button - Floating */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setShowMobilePreview(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-full shadow-lg hover:bg-slate-800 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          编辑封面
        </button>
      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default App;
