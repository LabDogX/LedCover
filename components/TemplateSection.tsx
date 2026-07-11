import React, { useState } from 'react';
import { LayoutTemplate, Save, Trash2 } from 'lucide-react';
import { CoverTemplateId, CustomTemplate, Platform } from '../types';
import { getTemplatesForPlatform } from '../utils/templateGenerator';

interface TemplateSectionProps {
  platform: Platform;
  selectedTemplateId: CoverTemplateId;
  selectedCustomTemplateId: string | null;
  customTemplates: CustomTemplate[];
  onTemplateChange: (templateId: CoverTemplateId) => void;
  onCustomTemplateApply: (template: CustomTemplate) => void;
  onCustomTemplateSave: (name: string) => void;
  onCustomTemplateDelete: (templateId: string) => void;
}

const TemplateSection: React.FC<TemplateSectionProps> = ({
  platform,
  selectedTemplateId,
  selectedCustomTemplateId,
  customTemplates,
  onTemplateChange,
  onCustomTemplateApply,
  onCustomTemplateSave,
  onCustomTemplateDelete,
}) => {
  const templates = getTemplatesForPlatform(platform);
  const [templateName, setTemplateName] = useState('');
  const platformCustomTemplates = customTemplates.filter(template => template.platform === platform);

  const handleSave = () => {
    onCustomTemplateSave(templateName);
    setTemplateName('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <LayoutTemplate className="w-4 h-4" />
        封面模板
      </div>

      <div className="grid grid-cols-1 gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`text-left p-3 rounded-lg border transition-all ${
              !selectedCustomTemplateId && selectedTemplateId === template.id
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="text-sm font-bold">{template.name}</div>
            <div className="text-xs opacity-70 mt-1">{template.description}</div>
          </button>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-700">自定义模板</div>
          <span className="text-xs text-slate-400">仅保存在此浏览器</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSave();
            }}
            maxLength={40}
            placeholder="输入名称后保存当前封面"
            className="min-w-0 flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleSave}
            className="w-10 h-10 shrink-0 rounded-lg bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
            title="保存当前封面为模板"
            aria-label="保存当前封面为模板"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>

        {platformCustomTemplates.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {platformCustomTemplates.map((template) => (
              <div
                key={template.id}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  selectedCustomTemplateId === template.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onCustomTemplateApply(template)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="truncate text-sm font-bold text-slate-700">{template.name}</div>
                  <div className="mt-1 text-xs text-slate-400">点击应用并继续编辑</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`删除自定义模板“${template.name}”？`)) {
                      onCustomTemplateDelete(template.id);
                    }
                  }}
                  className="w-8 h-8 shrink-0 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="删除模板"
                  aria-label={`删除模板 ${template.name}`}
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-1">尚未保存这个平台的自定义模板。</div>
        )}
      </div>
    </div>
  );
};

export default TemplateSection;
