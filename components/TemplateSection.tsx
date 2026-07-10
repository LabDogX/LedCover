import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import { CoverTemplateId, Platform } from '../types';
import { getTemplatesForPlatform } from '../utils/templateGenerator';

interface TemplateSectionProps {
  platform: Platform;
  selectedTemplateId: CoverTemplateId;
  onTemplateChange: (templateId: CoverTemplateId) => void;
}

const TemplateSection: React.FC<TemplateSectionProps> = ({
  platform,
  selectedTemplateId,
  onTemplateChange,
}) => {
  const templates = getTemplatesForPlatform(platform);

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
              selectedTemplateId === template.id
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="text-sm font-bold">{template.name}</div>
            <div className="text-xs opacity-70 mt-1">{template.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSection;
