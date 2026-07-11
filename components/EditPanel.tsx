import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { EditableElement, BackgroundEdit, CoverTemplateId, CustomTemplate, Platform } from '../types';
import TemplateSection from './TemplateSection';
import TextEditSection from './TextEditSection';
import BackgroundEditSection from './BackgroundEditSection';
import ImageAdjustSection from './ImageAdjustSection';

interface EditPanelProps {
  platform: Platform;
  selectedTemplateId: CoverTemplateId;
  selectedCustomTemplateId: string | null;
  customTemplates: CustomTemplate[];
  editableElements: EditableElement[];
  background: BackgroundEdit | null;
  onTemplateChange: (templateId: CoverTemplateId) => void;
  onTextChange: (
    elementId: string,
    newText: string,
    color?: string,
    align?: 'left' | 'center' | 'right',
    fontFamily?: string,
    fontSize?: number
  ) => void;
  onCustomTemplateApply: (template: CustomTemplate) => void;
  onCustomTemplateSave: (name: string) => void;
  onCustomTemplateDelete: (templateId: string) => void;
  onElementVisibilityChange: (elementId: string, visible: boolean) => void;
  onBackgroundChange: (background: BackgroundEdit) => void;
  onReset: () => void;
  onClose?: () => void;
}

const EditPanel: React.FC<EditPanelProps> = ({
  platform,
  selectedTemplateId,
  selectedCustomTemplateId,
  customTemplates,
  editableElements,
  background,
  onTemplateChange,
  onTextChange,
  onCustomTemplateApply,
  onCustomTemplateSave,
  onCustomTemplateDelete,
  onElementVisibilityChange,
  onBackgroundChange,
  onReset,
  onClose,
}) => {
  return (
    <div className="w-full lg:w-[96%] bg-white rounded-2xl shadow-xl border border-slate-200 p-5 flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <h3 className="text-lg font-bold text-slate-800">编辑封面</h3>
        <div className="flex gap-1">
          <button
            onClick={onReset}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="重置到初始状态"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              title="关闭编辑"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 可滚动内容区 */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {/* 模板选择 */}
        <TemplateSection
          platform={platform}
          selectedTemplateId={selectedTemplateId}
          selectedCustomTemplateId={selectedCustomTemplateId}
          customTemplates={customTemplates}
          onTemplateChange={onTemplateChange}
          onCustomTemplateApply={onCustomTemplateApply}
          onCustomTemplateSave={onCustomTemplateSave}
          onCustomTemplateDelete={onCustomTemplateDelete}
        />

        {/* 文字编辑 */}
        <TextEditSection
          elements={editableElements}
          onChange={onTextChange}
          onVisibilityChange={onElementVisibilityChange}
        />

        {/* 背景编辑 */}
        <BackgroundEditSection
          background={background}
          onChange={onBackgroundChange}
        />

        {/* 图片调整（仅当背景类型为图片时显示） */}
        <ImageAdjustSection
          background={background}
          onChange={onBackgroundChange}
        />
      </div>
    </div>
  );
};

export default EditPanel;
